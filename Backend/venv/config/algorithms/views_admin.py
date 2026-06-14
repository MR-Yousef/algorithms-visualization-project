from .models import AlgorithmRequest, Algorithm
from accounts.permissions import admin_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse

@admin_required
def admin_requests_dashboard(request):

    requests = AlgorithmRequest.objects.filter(
        status='PENDING'
    ).order_by('-created_at')

    return render(request, 'algorithms/admin_dashboard.html', {
        'requests': requests
    })

@admin_required
def approve_request(request, id):

    req = get_object_or_404(AlgorithmRequest, id=id)

    if req.status != "PENDING":
        return HttpResponse("Already processed")
    algorithm = Algorithm.objects.create(
        title=req.title,
        description=req.description,
        code=req.code,
        topic=req.topic,
        owner=req.requested_by
    )

    req.status = 'APPROVED'
    req.reviewed_by = request.user
    req.save()

    return redirect('admin_dashboard')

@admin_required
def reject_request(request, id):

    req = get_object_or_404(AlgorithmRequest, id=id)

    if request.method == "POST":
        reason = request.POST.get('reason')

        req.status = 'REJECTED'
        req.admin_note = reason
        req.reviewed_by = request.user
        req.save()

        return redirect('admin_dashboard')

    return render(request, 'algorithms/reject_form.html', {
        'request': req
    })

@admin_required
def approve_request(request, id):

    req = get_object_or_404(AlgorithmRequest, id=id)

    # =========================
    # 1. CREATE REQUEST
    # =========================
    if req.request_type == "CREATE":

        algorithm = Algorithm.objects.create(
            title=req.title,
            description=req.description,
            code=req.code,
            topic=req.topic,
            owner=req.requested_by
        )

    # =========================
    # 2. UPDATE REQUEST
    # =========================
    elif req.request_type == "UPDATE":

        algorithm = req.algorithm  # الخوارزمية الأصلية

        algorithm.title = req.title
        algorithm.description = req.description
        algorithm.code = req.code
        algorithm.topic = req.topic
        algorithm.save()

    # =========================
    # 3. DELETE REQUEST
    # =========================
    elif req.request_type == "DELETE":

        algorithm = req.algorithm
        algorithm.is_archived = True
        algorithm.save()

    # =========================
    # تحديث الطلب
    # =========================
    req.status = "APPROVED"
    req.reviewed_by = request.user
    req.save()

    return redirect('admin_dashboard')