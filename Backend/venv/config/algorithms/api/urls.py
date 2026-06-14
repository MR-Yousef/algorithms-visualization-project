from django.urls import path

from .views import (
    AlgorithmListAPI,
    AlgorithmDetailAPI,
    CreateRequestAPI,
    MyRequestsAPI,
    RequestDetailAPI,
    PendingRequestsAPI,
    ApproveRequestAPI,
    RejectRequestAPI,
    SaveAlgorithmAPI,
    TopicListAPI,
    UnsaveAlgorithmAPI,
    MySavedAlgorithmsAPI,
    CreateTopicAPI,
    UpdateTopicAPI,
    DeleteTopicAPI,
    DocumentationListAPI,
    DocumentationDetailAPI,
    CreateDocumentationAPI,
    UpdateDocumentationAPI,
    DeleteDocumentationAPI,
    RequestsListAPI
)

urlpatterns = [

    path(
        '',
        AlgorithmListAPI.as_view()
    ),

    path(
        '<int:id>/',
        AlgorithmDetailAPI.as_view()
    ),
    path(
        'requests/create/',
        CreateRequestAPI.as_view()
    ),

    path(
        'requests/my/',
        MyRequestsAPI.as_view()
    ),

    path(
        'requests/<int:id>/',
        RequestDetailAPI.as_view()
    ),
    path(
        'admin/pending-requests/',
        PendingRequestsAPI.as_view()
    ),
    path(
        'admin/requests/<int:id>/approve/',
        ApproveRequestAPI.as_view()
    ),
    path(
        'admin/requests/<int:id>/reject/',
    RejectRequestAPI.as_view()
    ),
    path(
        '<int:algorithm_id>/save/',
    SaveAlgorithmAPI.as_view()
    ),

    path(
        '<int:algorithm_id>/unsave/',
        UnsaveAlgorithmAPI.as_view()
    ),

    path(
        'saved/',
        MySavedAlgorithmsAPI.as_view()
    ),
    path(
        'topics/',
        TopicListAPI.as_view()
    ),

    path(
        'topics/create/',
        CreateTopicAPI.as_view()
    ),

    path(
        'topics/<int:id>/update/',
        UpdateTopicAPI.as_view()
    ),

    path(
        'topics/<int:id>/delete/',
        DeleteTopicAPI.as_view()
    ),
    path(
    'documentation/',
        DocumentationListAPI.as_view()
    ),

    path(
        'documentation/<int:id>/',
        DocumentationDetailAPI.as_view()
    ),

    path(
        'documentation/create/',
        CreateDocumentationAPI.as_view()
    ),

    path(
        'documentation/<int:id>/update/',
        UpdateDocumentationAPI.as_view()
    ),

    path(
        'documentation/<int:id>/delete/',
        DeleteDocumentationAPI.as_view()
    ),
    path('requests/', RequestsListAPI.as_view())
]