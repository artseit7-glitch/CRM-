import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.companies.models import Company


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username="admin", password="pass12345", role=User.Role.ADMIN)


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
def test_manager_only_sees_own_companies(manager_user, other_manager):
    Company.objects.create(name="Mine", owner=manager_user)
    Company.objects.create(name="Not mine", owner=other_manager)

    resp = auth_client(manager_user).get("/api/companies/")

    assert resp.status_code == 200
    names = [c["name"] for c in resp.data["results"]]
    assert names == ["Mine"]


@pytest.mark.django_db
def test_admin_sees_all_companies(admin_user, manager_user, other_manager):
    Company.objects.create(name="A", owner=manager_user)
    Company.objects.create(name="B", owner=other_manager)

    resp = auth_client(admin_user).get("/api/companies/")

    assert resp.status_code == 200
    assert resp.data["count"] == 2


@pytest.mark.django_db
def test_manager_cannot_access_others_company_detail(manager_user, other_manager):
    company = Company.objects.create(name="Not mine", owner=other_manager)

    resp = auth_client(manager_user).get(f"/api/companies/{company.id}/")

    assert resp.status_code == 404


@pytest.mark.django_db
def test_create_company_sets_owner_automatically(manager_user):
    resp = auth_client(manager_user).post("/api/companies/", {"name": "New Co"})

    assert resp.status_code == 201
    assert resp.data["owner"] == manager_user.id


@pytest.mark.django_db
def test_anonymous_request_is_rejected():
    resp = APIClient().get("/api/companies/")

    assert resp.status_code == 401
