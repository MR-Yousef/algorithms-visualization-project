from rest_framework import serializers
from .models import AlgorithmRequest

class AlgorithmRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = AlgorithmRequest
        fields = 'all'
        read_only_fields = [
            'status',
            'admin_note',
            'created_at',
            'reviewed_at',
            'reviewed_by'
        ]