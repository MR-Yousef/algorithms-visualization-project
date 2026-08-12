from django.db import models
from accounts.models import User


class Topic(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name
    

class Algorithm(models.Model):

    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending'),
        ('PUBLISHED', 'Published'),
        ('REJECTED', 'Rejected'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    code = models.TextField()

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE
    )

    execution_count = models.PositiveBigIntegerField(
        default=0
    )

    views_count = models.BigIntegerField(
        default=0
    )

    is_archived = models.BooleanField(
        default=False
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title
    
class AlgorithmRequest(models.Model):

    REQUEST_TYPES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    )

    STATUS_TYPES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    request_type = models.CharField(max_length=10, choices=REQUEST_TYPES)

    algorithm = models.ForeignKey(
        'Algorithm',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    code = models.TextField()

    topic = models.ForeignKey('Topic', on_delete=models.SET_NULL, null=True)

    requested_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE)

    status = models.CharField(max_length=10, choices=STATUS_TYPES, default='PENDING')

    admin_note = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    reviewed_by = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_requests'
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)

class SavedAlgorithm(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.CASCADE
    )

    saved_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'user',
            'algorithm'
        )

class DocumentationSection(models.Model):

    title = models.CharField(max_length=200)

    content = models.TextField()

    TYPE_CHOICES = [
        ("LANGUAGE", "Language Guide"),
        ("FLOWCHART", "Flowchart Guide"),
        ("INPUT", "Input Method"),
    ]

    type_documintation = models.CharField(max_length=20, choices=TYPE_CHOICES)

    view_count = models.PositiveIntegerField(default=0)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_docs'
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_docs'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
    


class AlgorithmExecution(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='algorithm_executions'
    )

    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.CASCADE,
        related_name='executions'
    )

    executed_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-executed_at']
    def __str__(self):
        return f"{self.user.username} -> {self.algorithm.title}"