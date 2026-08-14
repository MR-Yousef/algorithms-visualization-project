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

        saved, created = SavedAlgorithm.objects.get_or_create(
            user=request.user,
            algorithm=algorithm
        )

        if not created:

            return api_success(
                message="Algorithm already saved"
            )

        return api_success(
            message="Algorithm saved successfully",
            status=201
        )

class UnsaveAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, algorithm_id):

        saved = get_object_or_404(
            SavedAlgorithm,
            user=request.user,
            algorithm_id=algorithm_id
        )

        saved.delete()

        return api_success(
            message="Algorithm removed from saved"
        )

class MySavedAlgorithmsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        saved = SavedAlgorithm.objects.filter(
            user=request.user,
            algorithm__status="PUBLISHED",
            algorithm__is_archived=False
        ).select_related(
            "algorithm"
        ).order_by("-saved_at")

        serializer = SavedAlgorithmSerializer(
            saved,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="Saved algorithms fetched successfully"
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
            status="DRAFT"
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
            is_archived=False
        ).prefetch_related(
            "topics"
        ).order_by("-created_at")

        serializer = AlgorithmSerializer(
            algorithms,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="My algorithms fetched successfully"
        )

class DeleteMyAlgorithmAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, algorithm_id):

        algorithm = get_object_or_404(
            Algorithm,
            id=algorithm_id,
            owner=request.user,
            is_archived=False
        )

        algorithm.is_archived = True

        algorithm.save(
            update_fields=["is_archived"]
        )

        return api_success(
            message="Algorithm deleted successfully"
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
            is_archived=False
        )

        AlgorithmExecution.objects.create(
            user=request.user,
            algorithm=algorithm
        )

        return api_success(
            message="Algorithm execution recorded successfully"
        )