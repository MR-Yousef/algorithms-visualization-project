from rest_framework import serializers
from accounts.models import User

from accounts.models import PromotionRequest
from algorithms.models import Algorithm, AlgorithmExecution
from django.db.models import Sum

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password'
        ]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='USER'
        )

class UserSerializer(serializers.ModelSerializer):

    published_algorithms_count = serializers.SerializerMethodField()

    executed_algorithms_count = serializers.SerializerMethodField()

    total_algorithm_runs = serializers.SerializerMethodField()

    rating = serializers.SerializerMethodField()

    impact_score = serializers.SerializerMethodField()

    def get_published_algorithms_count(self, obj):

        return Algorithm.objects.filter(
            owner=obj
        ).count()

    def get_executed_algorithms_count(self, obj):

        return AlgorithmExecution.objects.filter(
            user=obj
        ).count()

    def get_total_algorithm_runs(self, obj):

        total = Algorithm.objects.filter(
            owner=obj   
        ).aggregate(
            total_runs=Sum('execution_count')
        )
        return total['total_runs'] or 0

    def get_rating(self, obj):

        total_runs = self.get_total_algorithm_runs(obj)

        if total_runs >= 5000:                                                                                                      
            return 5

        elif total_runs >= 1000:
            return 4

        elif total_runs >= 500:
            return 3

        elif total_runs >= 100:
            return 2

        return 1

    def get_impact_score(self, obj):

        published_count = self.get_published_algorithms_count(obj)

        total_runs = self.get_total_algorithm_runs(obj)

        return (published_count * 10) + total_runs
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'bio',
            'avatar',
            'created_at',
            'published_algorithms_count',
            'executed_algorithms_count',
            'total_algorithm_runs',
            'rating',
            'impact_score'
        ]

        read_only_fields = [
            'id',
            'username',
            'email',
            'role',
            'created_at'
        ]

class PromotionRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = PromotionRequest

        fields = '__all__'

        read_only_fields = [
            'requested_by',
            'status',
            'reviewed_by',
            'reviewed_at'
        ]

class UserAdminSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'role',
            'is_active',
            'created_at'
        ]