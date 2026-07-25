
from rest_framework.views import APIView
from rest_framework.response import Response
from algorithms.models import Algorithm, AlgorithmExecution
from .serializers import AlgorithmSerializer, AlgorithmRequestSerializer, SavedAlgorithmSerializer , TopicSerializer, DocumentationSection, DocumentationSerializer 
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from algorithms.models import AlgorithmRequest
from .permissions import IsContributor
from .permissions import IsAdmin
from django.utils import timezone
from algorithms.models import SavedAlgorithm
from algorithms.models import Topic

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from core.api_response import api_success, api_error

from django.db import transaction

from rest_framework.generics import ListAPIView

class AlgorithmListAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.all()
                                                                                                                        
        search = request.query_params.get('search')

        if search:
            algorithms = algorithms.filter(title__icontains=search)

        serializer = AlgorithmSerializer(algorithms, many=True)

        return api_success(
            data=serializer.data,
            message="Algorithms fetched successfully"
        )
    
class AlgorithmDetailAPI(APIView):

    def get(self, request, id):

        algorithm = get_object_or_404(
            Algorithm,
            id=id,
            is_archived=False
        )

        algorithm.views_count += 1
        algorithm.save()

        serializer = AlgorithmSerializer(
            algorithm
        )

        return api_success(
            data=serializer.data,
            message="Algorithm details fetched successfully"
        )

class CreateRequestAPI(APIView):

    permission_classes = [IsContributor]

    def post(self, request):

        serializer = AlgorithmRequestSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                requested_by=request.user,
                status='PENDING'
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )
    
class MyRequestsAPI(APIView):

    permission_classes = [IsContributor]

    def get(self, request):

        requests = AlgorithmRequest.objects.filter(
            requested_by=request.user
        ).order_by('-created_at')

        serializer = AlgorithmRequestSerializer(
            requests,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="My requests fetched successfully"
        )

class RequestDetailAPI(APIView):

    permission_classes = [IsContributor]

    def get(self, request, id):

        req = get_object_or_404(
            AlgorithmRequest,
            id=id,
            requested_by=request.user
        )

        serializer = AlgorithmRequestSerializer(req)

        return Response(serializer.data)
    
class PendingRequestsAPI(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        requests = AlgorithmRequest.objects.filter(
            status='PENDING'
        ).order_by('-created_at')

        serializer = AlgorithmRequestSerializer(
            requests,
            many=True
        )

        return Response(serializer.data)
    

class ApproveRequestAPI(APIView):

    permission_classes = [IsAdmin]

    def post(self, request, id):

        req = get_object_or_404(
            AlgorithmRequest,
            id=id
        )

        if req.status != 'PENDING':
            return api_error(
                message="Already processed",
                status=400
            )

        # CREATE
        if req.request_type == 'CREATE':

            Algorithm.objects.create(
                title=req.title,
                description=req.description,
                code=req.code,
                topic=req.topic,
                owner=req.requested_by
            )

        # UPDATE
        elif req.request_type == 'UPDATE':

            algorithm = req.algorithm

            algorithm.title = req.title
            algorithm.description = req.description
            algorithm.code = req.code
            algorithm.topic = req.topic

            algorithm.save()

        # DELETE
        elif req.request_type == 'DELETE':

            req.algorithm.is_archived = True
            req.algorithm.save()

        req.status = 'APPROVED'
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()

        req.save()

        return api_error(
        message="Request approved",
        )
    

class RejectRequestAPI(APIView):

    permission_classes = [IsAdmin]

    def post(self, request, id):

        req = get_object_or_404(
            AlgorithmRequest,
            id=id
        )

        if req.status != 'PENDING':

            return api_error(
                message="Already processed",
                status=400
            )

        reason = request.data.get(
            'reason',
            ''
        )

        req.status = 'REJECTED'

        req.admin_note = reason

        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()

        req.save()

        return api_error(
            message="Request reject",
        )


class MyPublishedAlgorithmsAPI(ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = AlgorithmSerializer

    def get_queryset(self):

        return Algorithm.objects.filter(
            owner=self.request.user,
            is_archived=False
        ).order_by('-created_at')

class SaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            is_archived=False
        )

        saved, created = (
            SavedAlgorithm.objects.get_or_create(
                user=request.user,
                algorithm=algorithm
            )
        )

        if not created:
            
            return api_success(
                message='Already saved',
                status=201
            )
    

class UnsaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(
        self,
        request,
        algorithm_id
    ):

        saved = get_object_or_404(
            SavedAlgorithm,
            user=request.user,
            algorithm_id=algorithm_id
        )

        saved.delete()

        return api_error(
            message="Removed from saved",
        )
    

class MySavedAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        saved = SavedAlgorithm.objects.filter(
            user=request.user
        ).order_by('-saved_at')

        serializer = (
            SavedAlgorithmSerializer(
                saved,
                many=True
            )
        )

        return Response(
            serializer.data
        )
    
class TopicListAPI(APIView):

    def get(self, request):

        topics = Topic.objects.all().order_by('name')

        serializer = TopicSerializer(
            topics,
            many=True
        )

        return Response(serializer.data)
    

class CreateTopicAPI(APIView):

    permission_classes = [IsAdmin]

    def post(self, request):

        serializer = TopicSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )
    

class UpdateTopicAPI(APIView):

    permission_classes = [IsAdmin]

    def put(self, request, id):

        topic = get_object_or_404(
            Topic,
            id=id
        )

        serializer = TopicSerializer(
            topic,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )
    
class DeleteTopicAPI(APIView):

    permission_classes = [IsAdmin]

    def delete(self, request, id):

        topic = get_object_or_404(
            Topic,
            id=id
        )

        topic.delete()

        return api_error(
            message="Topic deleted",
        )
    
class DocumentationListAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        docs = DocumentationSection.objects.all()

        serializer = DocumentationSerializer(
            docs,
            many=True
        )

        return Response(serializer.data)
    
class DocumentationDetailAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        doc = get_object_or_404(
            DocumentationSection,
            id=id
        )

        doc.view_count += 1
        doc.save()

        serializer = DocumentationSerializer(doc)

        return api_success(
            data=serializer.data
        )
    

class CreateDocumentationAPI(APIView):

    permission_classes = [IsAdmin]

    def post(self, request):

        serializer = DocumentationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                created_by=request.user,
                updated_by=None
            )

            return api_success(
                data=serializer.data,
                status=201
            )

        return api_error(
            message=serializer.errors,
            status=400
        )
    

class UpdateDocumentationAPI(APIView):

    permission_classes = [IsAdmin]

    def put(self, request, id):

        doc = get_object_or_404(
            DocumentationSection,
            id=id
        )

        serializer = DocumentationSerializer(
            doc,
            data=request.data,
            partial=True
        )
        doc.updated_at = timezone.now()
        doc.updated_by = request.user
        if serializer.is_valid():

            serializer.save(
                updated_by=request.user
            )

            return api_success(
                data=serializer.data
            )

        return api_error(
            message=serializer.errors,
            status=400
        )
    

class DeleteDocumentationAPI(APIView):

    permission_classes = [IsAdmin]

    def delete(self, request, id):

        doc = get_object_or_404(
            DocumentationSection,
            id=id
        )

        doc.delete()

        return api_success(
            message="Documentation deleted",
        )
    

class RequestsListAPI(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        requests = AlgorithmRequest.objects.all()

        status = request.query_params.get('status')

        if status:
            requests = requests.filter(status=status)

        serializer = AlgorithmRequestSerializer(requests, many=True)

        return Response(serializer.data)

class ExecuteAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(Algorithm, id=algorithm_id)

        with transaction.atomic():

            AlgorithmExecution.objects.create(
                user=request.user,
                algorithm=algorithm
            )

            algorithm.execution_count = algorithm.execution_count + 1
            algorithm.save(update_fields=['execution_count'])

        return api_success(
            message="Execution recorded successfully"
        )
