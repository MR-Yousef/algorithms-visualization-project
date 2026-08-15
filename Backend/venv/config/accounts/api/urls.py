from django.urls import path

from .views import (
    RegisterAPI,
    LoginAPI,
    MeAPI,
    LogoutAPI,
    DeleteMyAccountAPI,

    ForgotPasswordAPI,
    VerifyOTPAPI,
    ResetPasswordAPI,
    ChangePasswordAPI,

    LogoutAllDevicesAPI,

    UsersListAPI,
    DeleteUserAPI,

    VerifyEmailAPI,
    ResendVerificationOTPAPI,
)

from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [

    # =========================
    # Authentication
    # =========================

    path(
        'register/',
        RegisterAPI.as_view(),
        name='register'
    ),

    path(
        'login/',
        LoginAPI.as_view(),
        name='login'
    ),

    path(
        'refresh/',
        TokenRefreshView.as_view(),
        name='token-refresh'
    ),

    path(
        'logout/',
        LogoutAPI.as_view(),
        name='logout'
    ),

    path(
        'logout-all/',
        LogoutAllDevicesAPI.as_view(),
        name='logout-all'
    ),


    # =========================
    # Current User
    # =========================

    path(
        'me/',
        MeAPI.as_view(),
        name='me'
    ),

    path(
        'change-password/',
        ChangePasswordAPI.as_view(),
        name='change-password'
    ),

    path(
        'delete-account/',
        DeleteMyAccountAPI.as_view(),
        name='delete-account'
    ),


    # =========================
    # Password Reset
    # =========================

    path(
        'forgot-password/',
        ForgotPasswordAPI.as_view(),
        name='forgot-password'
    ),

    path(
        'verify-otp/',
        VerifyOTPAPI.as_view(),
        name='verify-otp'
    ),

    path(
        'reset-password/',
        ResetPasswordAPI.as_view(),
        name='reset-password'
    ),


    # =========================
    # Email Verification
    # =========================

    path(
        'verify-email/',
        VerifyEmailAPI.as_view(),
        name='verify-email'
    ),

    path(
        'resend-verification-otp/',
        ResendVerificationOTPAPI.as_view(),
        name='resend-verification-otp'
    ),


    # =========================
    # User Management
    # =========================

    path(
        'users/',
        UsersListAPI.as_view(),
        name='users-list'
    ),

    path(
        'users/<int:id>/delete/',
        DeleteUserAPI.as_view(),
        name='user-delete'
    ),
]