from django.contrib import admin
from .models import Topic, Algorithm, AlgorithmRequest
# Register your models here.
admin.site.register(Topic)
admin.site.register(Algorithm)
admin.site.register(AlgorithmRequest)
