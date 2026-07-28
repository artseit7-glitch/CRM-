from django.conf import settings
from django.http import HttpResponse


def spa_index(request, *args, **kwargs):
    index_path = settings.FRONTEND_DIST / "index.html"
    if not index_path.exists():
        return HttpResponse("Frontend build not found.", status=404)
    return HttpResponse(index_path.read_text(), content_type="text/html")
