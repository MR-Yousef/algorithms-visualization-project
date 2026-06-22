# from .models import User
# from django.contrib.auth.backends import BaseBackend
# from django.db.models import Q

# class EmailBackend(BaseBackend):

#     def authenticate(self, request, email=None, password=None):
#         try:
#             user = User.objects.get(
#                 Q(email=email) |
#                 Q(username = email)
#             )
            
#             if user.is_active and user.check_password(password):
#                 return user

#         except User.DoesNotExist:
#             return None

#     def get_user(self, user_id):
#         try:
#             return User.objects.get(id=user_id)
#         except:
#             return None