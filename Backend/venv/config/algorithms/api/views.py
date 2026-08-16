
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from algorithms.models import (
    Algorithm,
    SavedAlgorithm,
    Topic,
    DocumentationSection,
    AlgorithmExecution,
)
from accounts.models import User

from .serializers import (
    AlgorithmSerializer,
    SavedAlgorithmSerializer,
    TopicSerializer,
    DocumentationSerializer,
)

from core.api_response import api_success, api_error


class AlgorithmListAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.filter(
            status="PUBLISHED",
            is_archived=False
        ).prefetch_related("topics").order_by("-created_at")

        search = request.query_params.get("search")

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

    permission_classes = [IsAuthenticated]

    def get(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            status="PUBLISHED",
            is_archived=False
        )

        algorithm.views_count += 1
        algorithm.save(
            update_fields=["views_count"]
        )

        serializer = AlgorithmSerializer(
            algorithm
        )

        return api_success(
            data=serializer.data,
            message="Algorithm details fetched successfully"
        )

class SaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            status="PUBLISHED",
            is_archived=False
        )

        # Owner cannot save his own published algorithm
        if algorithm.owner == request.user:
            return api_error(
                message="You cannot save your own published algorithm",
                status=400
            )

        saved_algorithm, created = SavedAlgorithm.objects.get_or_create(
            user=request.user,
            algorithm=algorithm
        )

        if not created:
            return api_error(
                message="Algorithm is already saved",
                status=400
            )

        return api_success(
            message="Algorithm saved successfully"
        )

class UnsaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, algorithm_id):

        saved_algorithm = get_object_or_404(
            SavedAlgorithm,
            user=request.user,
            algorithm_id=algorithm_id,
            algorithm__status="PUBLISHED",
            algorithm__is_archived=False
        )

        saved_algorithm.delete()

        return api_success(
            message="Algorithm unsaved successfully"
        )

class MyPublishedAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.filter(
            saved_by__user=request.user,
            status="PUBLISHED",
            is_archived=False
        ).select_related(
            "owner"
        ).prefetch_related(
            "topics"
        ).order_by(
            "-created_at"
        )

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="My published algorithms fetched successfully"
        )

class CreateMyAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AlgorithmSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return api_error(
                message="Invalid algorithm data",
                errors=serializer.errors,
                status=400
            )

        algorithm = serializer.save(
            owner=request.user,
            status="DRAFT",
            is_archived=False
        )

        return api_success(
            data=AlgorithmSerializer(
                algorithm
            ).data,
            message="Algorithm saved successfully",
            status=201
        )

class MyAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        algorithms = Algorithm.objects.filter(
            owner=request.user,
            status="DRAFT",
            is_archived=False
        ).prefetch_related(
            "topics"
        ).order_by(
            "-created_at"
        )

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="My draft algorithms fetched successfully"
        )
    
class DeleteMyAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            owner=request.user
        )

        if algorithm.status != "DRAFT":
            return api_error(
                message="Only draft algorithms can be archived directly",
                status=400
            )

        if algorithm.is_archived:
            return api_error(
                message="Algorithm is already archived",
                status=400
            )

        algorithm.is_archived = True

        algorithm.save(
            update_fields=["is_archived"]
        )

        return api_success(
            message="Draft algorithm archived successfully"
        )
    
class TopicListAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        topics = Topic.objects.all().order_by("name")

        serializer = TopicSerializer(
            topics,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="Topics fetched successfully"
        )

class DocumentationListAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        docs = DocumentationSection.objects.all().order_by(
            "documentation_type"
        )

        serializer = DocumentationSerializer(
            docs,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="Documentation fetched successfully"
        )

class DocumentationDetailAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, documentation_id):

        doc = get_object_or_404(
            DocumentationSection,
            id=documentation_id
        )

        doc.view_count += 1

        doc.save(
            update_fields=["view_count"]
        )

        serializer = DocumentationSerializer(
            doc
        )

        return api_success(
            data=serializer.data,
            message="Documentation fetched successfully"
        )

class ExecuteAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            status="PUBLISHED",
            is_archived=False
        )

        AlgorithmExecution.objects.create(
            user=request.user,
            algorithm=algorithm
        )

        return api_success(
            message="Algorithm execution recorded successfully"
        )

class SystemStatisticsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_users = User.objects.count()


        published_algorithms = Algorithm.objects.filter(
            status="PUBLISHED",
            is_archived=False
        ).count()

        total_algorithm_executions = AlgorithmExecution.objects.filter(
            algorithm__status="PUBLISHED",
            algorithm__is_archived=False
        ).count()

        return api_success(
            data={
                "total_users": total_users,
                "published_algorithms": published_algorithms,
                "total_algorithm_executions": total_algorithm_executions,
            },
            message="System statistics fetched successfully"
        )
class MySavedAlgorithmsStatisticsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        saved_algorithm_ids = SavedAlgorithm.objects.filter(
            user=request.user
        ).values_list(
            "algorithm_id",
            flat=True
        )

        total_executions = AlgorithmExecution.objects.filter(
            algorithm_id__in=saved_algorithm_ids
        ).count()

        return api_success(
            data={
                "saved_algorithms_executions": total_executions
            },
            message="Saved algorithms statistics fetched successfully"
        )