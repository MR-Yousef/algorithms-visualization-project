
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken        
from accounts.models import User, PasswordResetOTP
from rest_framework import status

from algorithms.api.permissions import IsAdmin, IsSuperAdmin
from .serializers import PromotionRequestSerializer, RegisterSerializer, UserAdminSerializer

from rest_framework.permissions import IsAuthenticated, AllowAny 
from .serializers import UserSerializer

from accounts.models import PromotionRequest
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .permissions import IsSuperAdmin

from core.api_response import api_success, api_error

import random
from django.core.mail import send_mail

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from datetime import timedelta


class LoginAPI(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        login = request.data.get("login")
        password = request.data.get("password")

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

        if not user.is_active:
            return api_error(
                message="Account is deactivated",
                status=403
            )

        refresh = RefreshToken.for_user(user)

        return api_success(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "role": user.role
                }
            },
            "Login successful"
        )

    
class RegisterAPI(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return api_success(
                message="Account created successfully",
                status=status.HTTP_201_CREATED
            )

        return api_error(
            message="Validation erroe",
            errors=serializer.errors,
            status=400
        )

class MeAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return api_error(
            message="erroe data",
            errors=serializer.errors,
            status=400
        )
    
class CreatePromotionRequestAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        requested_role = request.data.get('requested_role')
        reason = request.data.get('reason')

        if not requested_role:
            return api_error("requested_role is required", 400)

        if not reason:
            return api_error("reason is required", 400)

        if request.user.role == requested_role:
            return api_error("You already have this role", 400)

        if request.user.role not in ['USER', 'CONTRIBUTOR']:
            return api_error("You are not allowed to request promotion", 403)

        if request.user.role == 'USER' and requested_role != 'CONTRIBUTOR':
            return api_error("Invalid promotion", 400)

        if request.user.role == 'CONTRIBUTOR' and requested_role != 'ADMIN':
            return api_error("Invalid promotion", 400)

        existing = PromotionRequest.objects.filter(
            requested_by=request.user,
            status='PENDING'
        ).exists()

        if existing:
            return api_error(
                message="You already have a pending request",
                status=400
            )

        promotion = PromotionRequest.objects.create(
            requested_by=request.user,
            requested_role=requested_role,
            reason=reason
        )

        serializer = PromotionRequestSerializer(promotion)

        return api_success(
            message="ok request",
            data=serializer.data,
            status=201
        )
    

class MyPromotionRequestsAPI(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        requests = PromotionRequest.objects.filter(
            requested_by=request.user
        ).order_by('-created_at')

        serializer = PromotionRequestSerializer(
            requests,
            many=True
        )

        return api_success(
                    message="success",
                    data=serializer.data,
                    status=200
                )
    

class PromotionRequestsAdminAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def get(self, request):

        requests = PromotionRequest.objects.filter(
            status='PENDING'
        )

        serializer = PromotionRequestSerializer(
            requests,
            many=True
        )

        return api_success(
            message="success",
            data=serializer.data,
            status=200
        )
    
class ApprovePromotionAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def post(self, request, id):

        promotion = get_object_or_404(
            PromotionRequest,
            id=id
        )
        if promotion.status != 'PENDING':
            return api_error(
                message="Already processed",
                status=400
            )

        if promotion.requested_by == request.user:
            return api_error("You cannot approve your own request", status=403)
        allowed_roles = ['CONTRIBUTOR', 'ADMIN']
        if promotion.requested_role not in allowed_roles:
            return api_error("Invalid role", status=400)
        
        with transaction.atomic():
            user = promotion.requested_by
            user.role = promotion.requested_role
            user.save()

            promotion.status = 'APPROVED'
            promotion.reviewed_by = request.user
            promotion.reviewed_at = timezone.now()
            promotion.save()

        return api_success(
            message="Promotion approved",
            data={
                "user_id": user.id,
                "new_role":user.role,
                "request_id":promotion.id
            }
        )
    
class RejectPromotionAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def post(self, request, id):

        promotion = get_object_or_404(
            PromotionRequest,
            id=id
        )

        if promotion.status != 'PENDING':

            return api_error(
                message="Already processed",
                status=400
            )

        promotion.status = 'REJECTED'

        promotion.admin_note = request.data.get(
            'reason',
            ''
        )

        promotion.reviewed_by = request.user

        promotion.reviewed_at = timezone.now()

        promotion.save()

        return api_error(
            message="Promotion rejected",
        )
    

class UsersListAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def get(self, request):

        users = User.objects.all()

        role = request.query_params.get('role')

        if role:
            users = users.filter(role=role)

        serializer = UserAdminSerializer(users, many=True)

        return Response(serializer.data)
    

class PromoteUserAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def post(self, request, id):

        user = get_object_or_404(User, id=id)

        if user.role == 'USER':
            user.role = 'CONTRIBUTOR'
            user.save()

            return api_error(message="User promoted to CONTRIBUTOR",)

        return api_error(message="Invalid promotion", status=400)
    


class DemoteUserAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def post(self, request, id):

        user = get_object_or_404(User, id=id)

        if user.role == 'CONTRIBUTOR':
            user.role = 'USER'
            user.save()

            return api_error(message="User demoted to USER",)

        return api_error(message="Invalid demotion", status=400)
    


class DeleteUserAPI(APIView):

    permission_classes = [IsAdmin | IsSuperAdmin]

    def delete(self, request, id):

        user = get_object_or_404(User, id=id)

        if request.user.id == user.id:
            return api_error("You cannot delete yourself", 400)

        if request.user.role == "ADMIN":
            if user.role in ["ADMIN", "SUPER_ADMIN"]:
                return api_error("Admin cannot delete this user", 403)

        elif request.user.role == "SUPER_ADMIN":
            if user.role in ["SUPER_ADMIN"]:
                return api_error("Super admin cannot delete this user", 403)
            pass

        user.delete()

        return api_success("User deleted successfully")
    

class PromoteToAdminAPI(APIView):

    permission_classes = [IsSuperAdmin]

    def post(self, request, id):

        user = get_object_or_404(User, id=id)

        if user.role in ['USER', 'CONTRIBUTOR']:
            user.role = 'ADMIN'
            user.save()

            return api_error(message="User promoted to ADMIN",)

        return api_error(message="Invalid operation", status=400)
    

class DemoteAdminAPI(APIView):

    permission_classes = [IsSuperAdmin]

    def post(self, request, id):

        user = get_object_or_404(User, id=id)

        if user.role == 'ADMIN':
            user.role = 'CONTRIBUTOR'
            user.save()

            return api_error(message="Admin demoted to CONTRIBUTOR")

        return api_error(message="Invalid operation", status=400)
    


class LogoutAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data.get("refresh")

            token = RefreshToken(refresh_token)

            token.blacklist()

            return api_success(
                message="Logged out successfully"
            )

        except Exception:
            return api_error(
                message="Invalid token",
                status=400
            )
        
class DeleteMyAccountAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        if password != confirm_password:
            return api_error(
                message="Password do not match",
                status=400
            )
        user = request.user

        if not user.check_password(password):
            return api_error("Wrong password", 400)

        # logout all tokens
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        # hard delete
        user.delete()

        return api_success("Account deleted successfully")

    

class ForgotPasswordAPI(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")

        user = User.objects.filter(email=email).first()

        if not user:
            return api_error("User not found", 404)
        PasswordResetOTP.objects.filter(
            user=user,
            is_used=False
        ).delete()

        code = str(random.randint(100000, 999999))

        PasswordResetOTP.objects.create(
            user=user,
            code=code,
            created_at=timezone.now()
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

        email = request.data.get("email")
        code = request.data.get("code")

        user = User.objects.filter(email=email).first()

        if not user:
            return api_error("Invalid email", 404)

        otp = PasswordResetOTP.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()

        if not otp:
            return api_error("Invalid code", 400)

        if (timezone.now() - otp.created_at).seconds > 600:
            return api_error("Code expired", 400)

        return api_success(
            message="OTP verified"
        )
        
class ResetPasswordAPI(APIView):
    permission_classes = [AllowAny]
    def post(self, request):    

        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        user = User.objects.filter(email=email).first()

        if not user:
            return api_error("Invalid email", 404)

        otp = PasswordResetOTP.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()

        if not otp:
            return api_error("Invalid code", 400)

        # update password
        if new_password != confirm_password:
            return api_error(
                message="Password do not match",
                status=400
            )
        user.set_password(new_password)
        user.save()

        # mark OTP used
        otp.is_used = True
        otp.save()

        return api_success(
            message="Password reset successfully"
        )
    

class ChangePasswordAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

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

        user.set_password(new_password)
        user.save()

        return api_success(
            message="Password changed successfully"
        )

class LogoutAllDevicesAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        tokens = OutstandingToken.objects.filter(user=request.user)

        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        return api_success("Logged out from all devices")