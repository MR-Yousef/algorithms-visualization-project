from django.urls import path
from .views import create_algorithm_request,create_request_page, home, my_requests_view, algorithm_detail, save_algorithm, unsave_algorithm
from .views_admin import (
    admin_requests_dashboard,
    approve_request,
    reject_request
)
urlpatterns = [
    path('request/create/', create_algorithm_request),
    path('request/new/', create_request_page),
    path('home/', home, name='home'),
    path(
    'my-requests/',
    my_requests_view,
    name='my_requests'
    ),
]
urlpatterns += [
    path('admin/requests/', admin_requests_dashboard, name='admin_dashboard'),
    path('admin/approve/<int:id>/', approve_request),
    path('admin/reject/<int:id>/', reject_request),
    path('save/<int:id>/', save_algorithm, name='save_algorithm'),
    path('unsave/<int:id>/', unsave_algorithm, name='unsave_algorithm'),
]