from django.contrib import admin
from .models import Topic, Algorithm, SavedAlgorithm, DocumentationSection,AlgorithmExecution
# Register your models here.
admin.site.register(Topic)
admin.site.register(Algorithm)
admin.site.register(SavedAlgorithm)
admin.site.register(DocumentationSection)
admin.site.register(AlgorithmExecution)