from django.urls import path

from .views import (
    AlgorithmListAPI,
    AlgorithmDetailAPI,
    CreateDeleteRequestAPI,
    CreateRequestAPI,
    CreateUpdateRequestAPI,
    MyAlgorithmsAPI,
    MyPublishedAlgorithmsAPI,
    MyRequestsAPI,
    RequestDetailAPI,
    PendingRequestsAPI,
    ApproveRequestAPI,
    RejectRequestAPI,
    SaveAlgorithmAPI,
    SaveMyAlgorithmAPI,
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
    RequestsListAPI,
    ExecuteAlgorithmAPI,
    MyPublishedAlgorithmsAPI
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
        '<int:algorithm_id>/publish-request/',
        CreateRequestAPI.as_view(),
        name='create-publish-request'
    ),
    path(
        '<int:algorithm_id>/update-request/',
        CreateUpdateRequestAPI.as_view(),
        name='create-update-request'
    ),
    path(
        '<int:algorithm_id>/delete-request/',
        CreateDeleteRequestAPI.as_view(),
        name='create-delete-request'
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
    # saved algorithm that was puplished  
    path(
        '<int:algorithm_id>/save/',
        SaveAlgorithmAPI.as_view()
    ),

    path(
        '<int:algorithm_id>/unsave/',
        UnsaveAlgorithmAPI.as_view()
    ),
    path(
        'my-published/',
        MyPublishedAlgorithmsAPI.as_view(),
    ),
    # show saved published algorithm 
    path(
        'saved/',
        MySavedAlgorithmsAPI.as_view()
    ),
    # saved algorithm that he write it
    path(
        'my-algorithms/save/',
        SaveMyAlgorithmAPI.as_view()
    ),
    # show saved published algorithm 
    path(
        'algorithms/my/',
        MyAlgorithmsAPI.as_view(),
        name='my-algorithms'
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
    path('requests/', RequestsListAPI.as_view()),
    path('<int:algorithm_id>/execute/',ExecuteAlgorithmAPI.as_view())
]
