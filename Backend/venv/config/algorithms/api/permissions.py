from rest_framework.permissions import BasePermission


# class IsContributor(BasePermission):

#     def has_permission(self, request, view):

#         return (
#             request.user.is_authenticated
#             and request.user.role in [
#                 'CONTRIBUTOR',
#                 'ADMIN',
#                 'SUPER_ADMIN'
#             ]
#         )


class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                'ADMIN',
                'SUPER_ADMIN'
            ]
        )


class IsSuperAdmin(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == 'SUPER_ADMIN'
        )