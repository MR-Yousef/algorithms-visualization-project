from django.urls import path

from .views import (
    AlgorithmListAPI,
    AlgorithmDetailAPI,
    SaveAlgorithmAPI,
    UnsaveAlgorithmAPI,
    MySavedAlgorithmsAPI,
    CreateMyAlgorithmAPI,
    MyAlgorithmsAPI,
    DeleteMyAlgorithmAPI,
    TopicListAPI,
    DocumentationListAPI,
    DocumentationDetailAPI,
    ExecuteAlgorithmAPI,
)

urlpatterns = [

    # =========================
    # Public Published Algorithms
    # =========================

    path(
        '',
        AlgorithmListAPI.as_view(),
        name='algorithm-list'
    ),

    path(
        '<int:algorithm_id>/',
        AlgorithmDetailAPI.as_view(),
        name='algorithm-detail'
    ),

    # =========================
    # Save / Unsave Published Algorithms
    # =========================

    path(
        '<int:algorithm_id>/save/',
        SaveAlgorithmAPI.as_view(),
        name='save-algorithm'
    ),

    path(
        '<int:algorithm_id>/unsave/',
        UnsaveAlgorithmAPI.as_view(),
        name='unsave-algorithm'
    ),

    path(
        'saved/',
        MySavedAlgorithmsAPI.as_view(),
        name='my-saved-algorithms'
    ),

    # =========================
    # User's Own Algorithms
    # =========================

    path(
        'my/',
        MyAlgorithmsAPI.as_view(),
        name='my-algorithms'
    ),

    path(
        'my/create/',
        CreateMyAlgorithmAPI.as_view(),
        name='create-my-algorithm'
    ),

    path(
        'my/<int:algorithm_id>/delete/',
        DeleteMyAlgorithmAPI.as_view(),
        name='delete-my-algorithm'
    ),

    # =========================
    # Static Topics
    # =========================

    path(
        'topics/',
        TopicListAPI.as_view(),
        name='topic-list'
    ),

    # =========================
    # Static Documentation
    # =========================

    path(
        'documentation/',
        DocumentationListAPI.as_view(),
        name='documentation-list'
    ),

    path(
        'documentation/<int:documentation_id>/',
        DocumentationDetailAPI.as_view(),
        name='documentation-detail'
    ),

    # =========================
    # Algorithm Execution
    # =========================

    path(
        '<int:algorithm_id>/execute/',
        ExecuteAlgorithmAPI.as_view(),
        name='execute-algorithm'
    ),
]