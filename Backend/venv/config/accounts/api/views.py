from datetime import timedelta
import random

from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken
)

from accounts.models import User, PasswordResetOTP, EmailVerificationOTP

from core.api_response import api_success, api_error

from .permissions import IsAdmin, IsSuperAdmin
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserAdminSerializer,
)
class LoginAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        login = request.data.get('login')
        password = request.data.get('password')

        if not login or not password:
            return api_error(
                message="Login and password are required",
                status=400
            )

        user = User.objects.filter(
            Q(email=login) |
            Q(username=login)
        ).first()

        if not user:
            return api_error(
                message="Invalid credentials",
                status=401
            )

        if not user.check_password(password):
            return api_error(
                message="Invalid credentials",
                status=401
            )

        if not user.email_verified:
            return api_error(
                message="Please verify your email before logging in",
                status=403
            )

        if not user.is_active:
            return api_error(
                message="Account is deactivated",
                status=403
        )

        refresh = RefreshToken.for_user(user)

        return api_success(
            data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                }
            },
            message="Login successful",
            status=200
        )

class RegisterAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return api_error(
                errors=serializer.errors,
                message="Validation error",
                status=400
            )

        user = serializer.save()

        user.is_active = False
        user.email_verified = False

        user.save(
            update_fields=[
                'is_active',
                'email_verified'
            ]
        )

        EmailVerificationOTP.objects.filter(
            user=user,
            is_used=False
        ).delete()

        code = str(
            random.randint(100000, 999999)
        )

        EmailVerificationOTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(
                minutes=10
            )
        )

        send_mail(
            subject="Verify your AlgoHub account",
            message=(
                f"Your verification code is: {code}\n\n"
                "This code will expire in 10 minutes."
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False
        )

        return api_success(
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            message="Account created. Verification code sent to your email.",
            status=201
        )

class MeAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return api_success(
            data=serializer.data,
            message="User information retrieved successfully"
        )

    def put(self, request):

        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return api_success(
                data=serializer.data,
                message="Profile updated successfully"
            )

        return api_error(
            errors=serializer.errors,
            message="Validation error",
            status=400
        )

class UsersListAPI(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        users = User.objects.all().order_by('-created_at')

        role = request.query_params.get('role')

        if role:
            users = users.filter(role=role)

        serializer = UserAdminSerializer(
            users,
            many=True
        )

        return api_success(
            data=serializer.data,
            message="Users retrieved successfully"
        )

class DeleteUserAPI(APIView):

    permission_classes = [IsAdmin]

    def delete(self, request, id):

        user = get_object_or_404(
            User,
            id=id
        )

        if request.user.id == user.id:

            return api_error(
                message="You cannot delete yourself",
                status=400
            )

        if request.user.role == 'ADMIN':

            if user.role in [
                'ADMIN',
                'SUPER_ADMIN'
            ]:
                return api_error(
                    message="Admin cannot delete this user",
                    status=403
                )

        elif request.user.role == 'SUPER_ADMIN':

            if user.role == 'SUPER_ADMIN':

                return api_error(
                    message="Super admin cannot delete another super admin",
                    status=403
                )

        user.delete()

        return api_success(
            message="User deleted successfully"
        )

class LogoutAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.data.get('refresh')

        if not refresh_token:

            return api_error(
                message="Refresh token is required",
                status=400
            )

        try:

            token = RefreshToken(refresh_token)
            token.blacklist()

            return api_success(
                message="Logged out successfully"
            )

        except Exception:

            return api_error(
                message="Invalid refresh token",
                status=400
            )

class DeleteMyAccountAPI(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        password = request.data.get('password')

        if not password:

            return api_error(
                message="Password is required",
                status=400
            )

        user = request.user

        if not user.check_password(password):

            return api_error(
                message="Wrong password",
                status=400
            )

        tokens = OutstandingToken.objects.filter(
            user=user
        )

        for token in tokens:

            BlacklistedToken.objects.get_or_create(
                token=token
            )

        user.delete()

        return api_success(
            message="Account deleted successfully"
        )

class ForgotPasswordAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')

        if not email:

            return api_error(
                message="Email is required",
                status=400
            )

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return api_error(
                message="User not found",
                status=404
            )

        PasswordResetOTP.objects.filter(
            user=user,
            is_used=False
        ).delete()

        code = str(
            random.randint(100000, 999999)
        )

        PasswordResetOTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(
                minutes=10
            )
        )

        send_mail(
            subject="Password Reset Code",
            message=f"Your OTP code is: {code}",
            from_email=None,
            recipient_list=[email],
            fail_silently=False
        )

        return api_success(
            message="OTP sent successfully"
        )

class VerifyOTPAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:

            return api_error(
                message="Email and code are required",
                status=400
            )

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return api_error(
                message="Invalid email",
                status=404
            )

        otp = PasswordResetOTP.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()

        if not otp:

            return api_error(
                message="Invalid code",
                status=400
            )

        if timezone.now() > otp.expires_at:

            return api_error(
                message="Code expired",
                status=400
            )

        return api_success(
            message="OTP verified successfully"
        )

class ResetPasswordAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get(
            'confirm_password'
        )

        if not all([
            email,
            code,
            new_password,
            confirm_password
        ]):

            return api_error(
                message="All fields are required",
                status=400
            )

        if new_password != confirm_password:

            return api_error(
                message="Passwords do not match",
                status=400
            )

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return api_error(
                message="Invalid email",
                status=404
            )

        otp = PasswordResetOTP.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()

        if not otp:

            return api_error(
                message="Invalid code",
                status=400
            )

        if timezone.now() > otp.expires_at:

            return api_error(
                message="Code expired",
                status=400
            )

        user.set_password(new_password)
        user.save()

        otp.is_used = True
        otp.save()

        return api_success(
            message="Password reset successfully"
        )

class ChangePasswordAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        old_password = request.data.get(
            'old_password'
        )

        new_password = request.data.get(
            'new_password'
        )

        confirm_password = request.data.get(
            'confirm_password'
        )

        if not old_password or not new_password or not confirm_password:

            return api_error(
                message="All password fields are required",
                status=400
            )

        user = request.user

        if not user.check_password(old_password):

            return api_error(
                message="Old password is incorrect",
                status=400
            )

        if new_password != confirm_password:

            return api_error(
                message="Passwords do not match",
                status=400
            )

        if user.check_password(new_password):

            return api_error(
                message="New password must be different from the old password",
                status=400
            )

        user.set_password(new_password)
        user.save()

        return api_success(
            message="Password changed successfully"
        )
    
class LogoutAllDevicesAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        tokens = OutstandingToken.objects.filter(
            user=request.user
        )

        for token in tokens:

            BlacklistedToken.objects.get_or_create(
                token=token
            )

        return api_success(
            message="Logged out from all devices"
        )


class VerifyEmailAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:

            return api_error(
                message="Email and code are required",
                status=400
            )

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return api_error(
                message="Invalid email",
                status=404
            )

        if user.email_verified:

            return api_error(
                message="Email is already verified",
                status=400
            )

        otp = EmailVerificationOTP.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()

        if not otp:

            return api_error(
                message="Invalid verification code",
                status=400
            )

        if timezone.now() > otp.expires_at:

            return api_error(
                message="Verification code expired",
                status=400
            )

        user.email_verified = True
        user.is_active = True

        user.save(
            update_fields=[
                'email_verified',
                'is_active'
            ]
        )

        otp.is_used = True

        otp.save(
            update_fields=['is_used']
        )

        return api_success(
            message="Email verified successfully. You can now login."
        )

class ResendVerificationOTPAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')

        if not email:
            return api_error(
                message="Email is required",
                status=400
            )

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return api_error(
                message="Invalid email",
                status=404
            )

        if user.email_verified:
            return api_error(
                message="Email is already verified",
                status=400
            )

        # Delete old unused OTPs
        EmailVerificationOTP.objects.filter(
            user=user,
            is_used=False
        ).delete()

        # Generate new OTP
        code = str(
            random.randint(100000, 999999)
        )

        EmailVerificationOTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(
                minutes=10
            )
        )

        send_mail(
            subject="Verify your AlgoHub account",
            message=(
                f"Your new verification code is: {code}\n\n"
                "This code will expire in 10 minutes."
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False
        )

        return api_success(
            message="A new verification code has been sent"
        )
    