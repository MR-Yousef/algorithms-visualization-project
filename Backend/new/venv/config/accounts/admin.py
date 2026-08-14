from django.contrib import admin
from .models import User, PasswordResetOTP, EmailVerificationOTP
# Register your models here.

admin.site.register(User)
admin.site.register(PasswordResetOTP)
admin.site.register(EmailVerificationOTP)   

