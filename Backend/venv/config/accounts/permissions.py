from django.http import HttpResponseForbidden


def role_required(allowed_roles):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return HttpResponseForbidden("Not authenticated")

            if request.user.role not in allowed_roles:
                return HttpResponseForbidden("Permission denied")

            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator

def user_required(view_func):
    return role_required(['USER'])(view_func)

def contributor_required(view_func):
    return role_required(['CONTRIBUTOR'])(view_func)

def admin_required(view_func):
    return role_required(['ADMIN'])(view_func)

def super_admin_required(view_func):
    return role_required(['SUPER_ADMIN'])(view_func)

def admin_or_superadmin_required(view_func):
    return role_required(['ADMIN', 'SUPER_ADMIN'])(view_func)