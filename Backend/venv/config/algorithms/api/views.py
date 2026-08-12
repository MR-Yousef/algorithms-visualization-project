
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

        algorithms = Algorithm.objects.filter(
            status='PUBLISHED',
            is_archived=False
        ).order_by('-created_at')

        search = request.query_params.get('search')

        if search:
            algorithms = algorithms.filter(
                title__icontains=search
            )

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="Published algorithms fetched successfully"
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

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            owner=request.user,
            is_archived=False
        )
        
        if algorithm.status != 'DRAFT':
            return api_error(
                message="Only draft algorithms can be submitted for publishing",
                status=400
            )

        pending_request = AlgorithmRequest.objects.filter(
            algorithm=algorithm,
            status='PENDING'
        ).exists()

        if pending_request:
            return api_error(
                message="A pending request already exists for this algorithm",
                status=400
            )

        algorithm_request = AlgorithmRequest.objects.create(
            request_type='CREATE',
            algorithm=algorithm,
            title=algorithm.title,
            description=algorithm.description,
            code=algorithm.code,
            topic=algorithm.topic,
            requested_by=request.user,
            status='PENDING'
        )

        algorithm.status = 'PENDING'
        algorithm.save(update_fields=['status'])

        serializer = AlgorithmRequestSerializer(
            algorithm_request
        )

        return api_success(
            message="Publishing request created successfully",
            data=serializer.data,
            status=201
        )

class CreateUpdateRequestAPI(APIView):

    permission_classes = [IsContributor]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            owner=request.user,
            is_archived=False
        )

        if algorithm.status != 'PUBLISHED':
            return api_error(
                message="Only published algorithms can be updated",
                status=400
            )

        pending_request = AlgorithmRequest.objects.filter(
            algorithm=algorithm,
            request_type='UPDATE',
            status='PENDING'
        ).exists()

        if pending_request:
            return api_error(
                message="A pending update request already exists",
                status=400
            )
        
        title = request.data.get('title')
        description = request.data.get('description')
        code = request.data.get('code')
        topic_id = request.data.get('topic')

        if not title or not description or not code or not topic_id:
            return api_error(
                message="All algorithm fields are required",
                status=400
            )

        algorithm_request = AlgorithmRequest.objects.create(
            request_type='UPDATE',
            algorithm=algorithm,
            title=title,
            description=description,
            code=code,
            topic_id=topic_id,
            requested_by=request.user,
            status='PENDING'
        )

        serializer = AlgorithmRequestSerializer(
            algorithm_request
        )

        return api_success(
            message="Update request created successfully",
            data=serializer.data,
            status=201
        )

class CreateDeleteRequestAPI(APIView):

    permission_classes = [IsContributor]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            owner=request.user,
            is_archived=False
        )

        if algorithm.status != 'PUBLISHED':
            return api_error(
                message="Only published algorithms can be deleted",
                status=400
            )

        pending_request = AlgorithmRequest.objects.filter(
            algorithm=algorithm,
            request_type='DELETE',
            status='PENDING'
        ).exists()

        if pending_request:
            return api_error(
                message="A pending delete request already exists",
                status=400
            )

        algorithm_request = AlgorithmRequest.objects.create(
            request_type='DELETE',
            algorithm=algorithm,
            title=algorithm.title,
            description=algorithm.description,
            code=algorithm.code,
            topic=algorithm.topic,
            requested_by=request.user,
            status='PENDING'
        )

        serializer = AlgorithmRequestSerializer(
            algorithm_request
        )

        return api_success(
            message="Delete request created successfully",
            data=serializer.data,
            status=201
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

        algorithm = req.algorithm

        if not algorithm:
            return api_error(
                message="Algorithm not found for this request",
                status=400
            )

        if req.request_type == 'CREATE':

            if algorithm.status != 'PENDING':
                return api_error(
                    message="Algorithm is not pending",
                    status=400
                )

            algorithm.status = 'PUBLISHED'

            algorithm.save(
                update_fields=['status']
            )

        elif req.request_type == 'UPDATE':

            if algorithm.status != 'PUBLISHED':
                return api_error(
                    message="Only published algorithms can be updated",
                    status=400
                )

            algorithm.title = req.title
            algorithm.description = req.description
            algorithm.code = req.code
            algorithm.topic = req.topic

            algorithm.save()

        elif req.request_type == 'DELETE':

            if algorithm.status != 'PUBLISHED':
                return api_error(
                    message="Only published algorithms can be deleted",
                    status=400
                )

            algorithm.is_archived = True

            algorithm.save(
                update_fields=['is_archived']
            )

        req.status = 'APPROVED'
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()

        req.save()

        return api_success(
            message="Request approved successfully"
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

        algorithm = req.algorithm

        if not algorithm:
            return api_error(
                message="Algorithm not found for this request",
                status=400
            )

        algorithm.status = 'REJECTED'
        algorithm.save(
            update_fields=['status']
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

        return api_success(
            message="Request rejected successfully"
        )


class MyPublishedAlgorithmsAPI(ListAPIView):

    permission_classes = [IsContributor]
    serializer_class = AlgorithmSerializer

    def get_queryset(self):

        return Algorithm.objects.filter(
            owner=self.request.user,
            status='PUBLISHED',
            is_archived=False
        ).order_by('-created_at')

class SaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            status='PUBLISHED',
            is_archived=False
        )

        saved, created = SavedAlgorithm.objects.get_or_create(
            user=request.user,
            algorithm=algorithm
        )

        if not created:
            return api_success(
                message="Already saved",
                status=200
            )

        return api_success(
            message="Algorithm saved successfully",
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
    

# class MySavedAlgorithmsAPI(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):

#         saved = SavedAlgorithm.objects.filter(
#             user=request.user
#         ).order_by('-saved_at')

#         serializer = (
#             SavedAlgorithmSerializer(
#                 saved,
#                 many=True
#             )
#         )

#         return Response(
#             serializer.data
#         )

class MySavedAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        saved = SavedAlgorithm.objects.filter(
            user=request.user,
            algorithm__status='PUBLISHED',
            algorithm__is_archived=False
        ).order_by('-saved_at')

        serializer = SavedAlgorithmSerializer(
            saved,
            many=True
        )

        return api_success(
            message="Saved algorithms fetched successfully",
            data=serializer.data
        )

class SaveMyAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.filter(
            owner=request.user,
            is_archived=False
        ).order_by('-created_at')

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            message="My algorithms fetched successfully",
            data=serializer.data
        )

class MyAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.filter(
            owner=request.user,
            is_archived=False
        ).order_by('-created_at')

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            message="My algorithms fetched successfully",
            data=serializer.data
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
