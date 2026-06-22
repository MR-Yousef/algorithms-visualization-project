from rest_framework.response import Response

def api_success(data=None, message="success", status=200):

    return Response({
        "status": "success",
        "message": message,
        "data": data
    }, status=status)

def api_error(errors=None, message="error", status=400):

    return Response({
        "status": "error",
        "message": message,
        "errors": errors
    }, status=status)



