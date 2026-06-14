
from django.urls import path

from .views import (
    LoginAPI,
    ApprovePromotionAPI,
    CreatePromotionRequestAPI,
    MyPromotionRequestsAPI,
    PromotionRequestsAdminAPI,
    RegisterAPI,
    MeAPI,
    RejectPromotionAPI,
    UsersListAPI,
    PromoteUserAPI,
    DemoteUserAPI,
    DeleteUserAPI,
    PromoteToAdminAPI,
    DemoteAdminAPI,
    LogoutAPI,
    DeleteMyAccountAPI,
    ForgotPasswordAPI,
    VerifyOTPAPI,
    ResetPasswordAPI,
    ChangePasswordAPI,
    LogoutAllDevicesAPI
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path(
        'register/',
        RegisterAPI.as_view()
    ),

    path(
        'login/',
        LoginAPI.as_view()
    ),

    path(
        'refresh/',
        TokenRefreshView.as_view()
    ),

    path(
        'me/',
        MeAPI.as_view()
    ),
    path(
        'promotion/create/',
        CreatePromotionRequestAPI.as_view()
    ),

    path(
        'promotion/my/',
        MyPromotionRequestsAPI.as_view()
    ),

    path(
        'promotion/admin/',
        PromotionRequestsAdminAPI.as_view()
    ),

    path(
        'promotion/admin/<int:id>/approve/',
        ApprovePromotionAPI.as_view()
    ),

    path(
        'promotion/admin/<int:id>/reject/',
        RejectPromotionAPI.as_view()
    ),
    path('users/', UsersListAPI.as_view()),
    path('users/<int:id>/promote/', PromoteUserAPI.as_view()),
    path('users/<int:id>/demote/', DemoteUserAPI.as_view()),
    path('users/<int:id>/delete/', DeleteUserAPI.as_view()),

    path('admin/<int:id>/promote/', PromoteToAdminAPI.as_view()),
    path('admin/<int:id>/demote/', DemoteAdminAPI.as_view()),
    path('logout/', LogoutAPI.as_view()),
    path('delete-account/', DeleteMyAccountAPI.as_view()),
    path('forgot-password/', ForgotPasswordAPI.as_view()),
    path('verify-otp/', VerifyOTPAPI.as_view()),
    path('reset-password/', ResetPasswordAPI.as_view()),
    path('change-password/', ChangePasswordAPI.as_view()),
    path('logout-all/', LogoutAllDevicesAPI.as_view()),
]