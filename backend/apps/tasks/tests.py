import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.tasks.models import Task


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(username="mgr", password="pass12345", role=User.Role.MANAGER)


@pytest.fixture
def other_manager(db):
    return User.objects.create_user(username="mgr2", password="pass12345", role=User.Role.MANAGER)


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_manager_task_defaults_to_self_when_no_assignee_given(manager_user):
    resp = auth_client(manager_user).post(
        "/api/tasks/", {"title": "Call back", "due_date": timezone.now().isoformat()}
    )

    assert resp.status_code == 201
    assert resp.data["assignee"] == manager_user.id


@pytest.mark.django_db
def test_manager_cannot_assign_task_to_someone_else(manager_user, other_manager):
    resp = auth_client(manager_user).post(
        "/api/tasks/",
        {
            "title": "Call back",
            "due_date": timezone.now().isoformat(),
            "assignee": other_manager.id,
        },
    )

    assert resp.status_code == 201
    # silently forced back to the requesting manager, not the target user
    assert resp.data["assignee"] == manager_user.id


@pytest.mark.django_db
def test_manager_only_sees_own_tasks(manager_user, other_manager):
    Task.objects.create(title="Mine", due_date=timezone.now(), assignee=manager_user)
    Task.objects.create(title="Not mine", due_date=timezone.now(), assignee=other_manager)

    resp = auth_client(manager_user).get("/api/tasks/")

    assert resp.status_code == 200
    titles = [t["title"] for t in resp.data["results"]]
    assert titles == ["Mine"]
