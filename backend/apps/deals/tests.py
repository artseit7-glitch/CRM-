import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.deals.models import Deal


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
def test_deal_stage_change_does_not_error(manager_user, settings):
    settings.CELERY_TASK_ALWAYS_EAGER = True
    deal = Deal.objects.create(title="Big deal", owner=manager_user, amount=1000)

    resp = auth_client(manager_user).patch(f"/api/deals/{deal.id}/", {"stage": Deal.Stage.WON}, format="json")

    assert resp.status_code == 200
    assert resp.data["stage"] == Deal.Stage.WON


@pytest.mark.django_db
def test_manager_cannot_edit_others_deal(manager_user, other_manager):
    deal = Deal.objects.create(title="Not mine", owner=other_manager, amount=500)

    resp = auth_client(manager_user).patch(f"/api/deals/{deal.id}/", {"stage": Deal.Stage.WON}, format="json")

    assert resp.status_code == 404
