from rest_framework import serializers

from algorithms.models import (
    Algorithm,
    SavedAlgorithm,
    Topic,
    DocumentationSection,
)


class AlgorithmSerializer(serializers.ModelSerializer):

    owner_username = serializers.CharField(
        source="owner.username",
        read_only=True
    )

    topics = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Topic.objects.all()
    )

    class Meta:
        model = Algorithm

        fields = [
            "id",
            "title",
            "description",
            "code",
            "owner",
            "owner_username",
            "topics",
            "views_count",
            "is_archived",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "owner_username",
            "views_count",
            "is_archived",
            "status",
            "created_at",
            "updated_at",
        ]


class SavedAlgorithmSerializer(serializers.ModelSerializer):

    algorithm_title = serializers.CharField(
        source="algorithm.title",
        read_only=True
    )

    class Meta:
        model = SavedAlgorithm

        fields = [
            "id",
            "algorithm",
            "algorithm_title",
            "saved_at",
        ]

        read_only_fields = [
            "id",
            "saved_at",
        ]


class TopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Topic

        fields = [
            "id",
            "name",
            "description",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class DocumentationSerializer(serializers.ModelSerializer):

    class Meta:
        model = DocumentationSection

        fields = [
            "id",
            "title",
            "content",
            "documentation_type",
            "view_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "view_count",
            "created_at",
            "updated_at",
        ]