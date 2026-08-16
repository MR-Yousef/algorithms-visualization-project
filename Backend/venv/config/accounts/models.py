from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)

class UserManager(BaseUserManager):
    def create_user(
        self,
        email,
        username,
        password=None,
        role="USER"
    ):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            role=role
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(
        self,
        email,
        username,
        password=None
    ):
        user = self.create_user(
            email=email,
            username=username,
            password=password,
            role="SUPER_ADMIN"
        )
        user.is_staff = True
        user.is_superuser = True

        user.email_verified = True
        user.is_active = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser,PermissionsMixin):
    username = models.CharField(
        max_length=150,
        unique=True
    )
    email = models.EmailField(
        unique=True
    )
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('CONTRIBUTOR', 'Contributor'),
        ('ADMIN', 'Admin'),
        ('SUPER_ADMIN', 'Super Admin'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='USER'
    )
    bio = models.TextField(
        blank=True
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    is_active = models.BooleanField(
        default=True
    )
    is_staff = models.BooleanField(
        default=False
    )
    email_verified = models.BooleanField(
        default=False
    )
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [
        'username'
    ]
    def __str__(self):
        return self.email

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_otps'
    )
    code = models.CharField(
        max_length=6
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    is_used = models.BooleanField(
        default=False
    )
    expires_at = models.DateTimeField()
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.user.email} - Password Reset OTP"

class EmailVerificationOTP(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_otps'
    )
    code = models.CharField(
        max_length=6
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(
        default=False
    )
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.user.email} - Email Verification OTP"