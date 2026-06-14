from rest_framework import serializers
from accounts.models import User

from rest_framework import serializers
from accounts.models import User

from accounts.models import PromotionRequest

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

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'bio',
            'avatar',
            'created_at'
        ]

        read_only_fields = [
            'id',
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