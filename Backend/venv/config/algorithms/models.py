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
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    ]
    title = models.CharField(
        max_length=255
    )
    description = models.TextField()
    code = models.TextField()
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='algorithms'
    )
    topics = models.ManyToManyField(
        Topic,
        related_name='algorithms'
    )
    views_count = models.PositiveBigIntegerField(
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

class SavedAlgorithm(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_algorithms'
    )
    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )
    saved_at = models.DateTimeField(
        auto_now_add=True
    )
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'algorithm'],
                name='unique_saved_algorithm'
            )
        ]
    def __str__(self):
        return f"{self.user.username} -> {self.algorithm.title}"

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
    
class DocumentationSection(models.Model):
    DOCUMENTATION_TYPES = [
        ("LANGUAGE", "Language Guide"),
        ("FLOWCHART", "Flowchart Guide"),
        ("INPUT", "Input Method"),
    ]
    title = models.CharField(
        max_length=200
    )
    content = models.TextField()
    documentation_type = models.CharField(
        max_length=20,
        choices=DOCUMENTATION_TYPES
    )
    view_count = models.PositiveIntegerField(
        default=0
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_docs"
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="updated_docs"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )
    def __str__(self):
        return self.title
    

