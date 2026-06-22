from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):

    page_size = 10

    def get_paginated_response(self, data):

        return Response({
            "status": "success",
            "data": data,
            "pagination": {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "page_size": self.page_size
            }
        })