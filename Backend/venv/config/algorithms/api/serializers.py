from rest_framework import serializers
from algorithms.models import Algorithm
from algorithms.models import AlgorithmRequest

from algorithms.models import SavedAlgorithm

from algorithms.models import Topic

from algorithms.models import DocumentationSection

class AlgorithmSerializer(serializers.ModelSerializer):

    owner_username = serializers.CharField(
        source='owner.username',
        read_only=True
    )

    topic_name = serializers.CharField(
        source='topic.name',
        read_only=True
    )

    class Meta:
        model = Algorithm

        fields = [
            'id',
            'title',
            'description',
            'code',
            'owner_username',
            'topic_name',
            'views_count',
            'created_at'
        ]


class AlgorithmRequestSerializer(serializers.ModelSerializer):

    requested_by_username = serializers.CharField(
        source='requested_by.username',
        read_only=True
    )

    class Meta:
        model = AlgorithmRequest

        fields = '__all__'

        read_only_fields = [
            'requested_by',
            'status',
            'reviewed_by',
            'reviewed_at'
        ]

class SavedAlgorithmSerializer(
    serializers.ModelSerializer
):

    algorithm_title = serializers.CharField(
        source='algorithm.title',
        read_only=True
    )

    class Meta:
        model = SavedAlgorithm

        fields = [
            'id',
            'algorithm',
            'algorithm_title',
            'saved_at'
        ]


class TopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Topic

        fields = '__all__'

class DocumentationSerializer(serializers.ModelSerializer):

    class Meta:
        model = DocumentationSection

        fields = '__all__'

        read_only_fields = [
            'view_count',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]