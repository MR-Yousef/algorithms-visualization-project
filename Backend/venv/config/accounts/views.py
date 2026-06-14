from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import SignupForm, LoginForm
from .models import User
from accounts.permissions import contributor_required
from accounts.permissions import admin_required
from accounts.permissions import super_admin_required

from django.contrib.auth.decorators import login_required
from algorithms.models import Algorithm, AlgorithmRequest
from algorithms.models import SavedAlgorithm

def signup_view(request):
    form = SignupForm()
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.role = "USER"
            user.save()
            return redirect('login')
    return render(request, 'accounts/signup.html', {'form': form})

def login_view(request):

    form = LoginForm()

    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                print("LOGIN SUCCESS:", user.email)
                return redirect('home')
            else:
                print("LOGIN FAILED")

            # if user is not None:
            #     login(request, user)
            #     return redirect('home')
    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def profile(request):

    user = request.user

    saved_algorithms = SavedAlgorithm.objects.filter(user=user)

    created_algorithms = Algorithm.objects.filter(owner=user, is_archived=False)

    requests = AlgorithmRequest.objects.filter(requested_by=user)

    return render(request, 'accounts/profile.html', {
        'user': user,
        'saved_algorithms': saved_algorithms,
        'created_algorithms': created_algorithms,
        'requests': requests
    })

@login_required
def edit_profile(request):

    user = request.user

    if request.method == "POST":

        user.bio = request.POST.get("bio")

        if request.FILES.get("avatar"):
            user.avatar = request.FILES["avatar"]

        user.save()

        return redirect('profile')

    return render(request, 'accounts/edit_profile.html', {
        'user': user
    })