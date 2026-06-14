from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import contributor_required
from .models import AlgorithmRequest, Topic
from .serializers import AlgorithmRequestSerializer

from django.contrib.auth.decorators import login_required

from .models import SavedAlgorithm, Algorithm
from django.shortcuts import get_object_or_404, redirect, render
from accounts.permissions import user_required


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@contributor_required
def create_algorithm_request(request):

    data = request.data.copy()

    data['requested_by'] = request.user.id
    data['status'] = 'PENDING'

    serializer = AlgorithmRequestSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

@login_required
def create_request_page(request):

    if request.method == "POST":

        request_type = request.POST['request_type']

        algorithm = None

        # 🔥 فقط للـ UPDATE / DELETE
        if request_type in ['UPDATE', 'DELETE']:
            algorithm = Algorithm.objects.get(id=request.POST['algorithm_id'])

        AlgorithmRequest.objects.create(

            request_type=request_type,

            algorithm=algorithm,  # 🔥 مهم

            title=request.POST['title'],
            description=request.POST['description'],
            code=request.POST['code'],
            topic_id=request.POST['topic'],

            requested_by=request.user,
            status='PENDING'
        )

        return redirect('my_requests')

    algorithms = Algorithm.objects.filter(is_archived=False)
    topics = Topic.objects.filter(is_archived=False)

    return render(request, 'algorithms/create_request.html', {
        'algorithms': algorithms,
        'topics': topics
    })

@login_required
def my_requests_view(request):

    requests = AlgorithmRequest.objects.filter(
        requested_by=request.user
    ).order_by('-created_at')

    return render(
        request,
        'algorithms/my_requests.html',
        {'requests': requests}
    )


def algorithm_detail(request, id):

    algorithm = get_object_or_404(Algorithm, id=id)

    algorithm.views_count += 1
    algorithm.save()

    return render(request, 'algorithms/detail.html', {
        'algorithm': algorithm
    })

@user_required
def save_algorithm(request, id):

    algorithm = get_object_or_404(Algorithm, id=id)

    SavedAlgorithm.objects.get_or_create(
        user=request.user,
        algorithm=algorithm
    )

    return redirect('profile')

@user_required
def unsave_algorithm(request, id):

    algorithm = get_object_or_404(Algorithm, id=id)

    SavedAlgorithm.objects.filter(
        user=request.user,
        algorithm=algorithm
    ).delete()

    return redirect('profile')

@login_required
def home(request):
    return render(request, 'algorithms/home.html')

