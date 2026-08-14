from rest_framework import serializers

from accounts.models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

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
            'created_at',
        ]

        read_only_fields = [
            'id',
            'username',
            'email',
            'role',
            'created_at',
        ]


class UserAdminSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'role',
            'bio',
            'avatar',
            'is_active',
            'email_verified',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'email_verified',
        ]