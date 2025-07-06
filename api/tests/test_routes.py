from unittest.mock import patch


# Helper for auth headers
def auth_headers(jwt="test-jwt", refresh_token="dummy-refresh-token"):  # nosec
    return {"Authorization": f"Bearer {jwt}", "refresh-token": refresh_token}


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json["message"] == "API is running"


@patch(
    "api.utils.authentication.validate_token_and_get_user_id",
    return_value="123e4567-e89b-12d3-a456-426614174000",
)
def test_me_authenticated(mock_validate, client):
    resp = client.get("/api/me", headers=auth_headers())
    assert resp.status_code == 200
    assert "user_id" in resp.json


def test_me_unauthenticated(client):
    resp = client.get("/api/me")
    assert resp.status_code == 401
    assert "error" in resp.json


@patch(
    "api.services.categories_service.get_categories",
    return_value=[{"id": 1, "name": "Fiction"}],
)
def test_get_categories_success(mock_get, client):
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    assert isinstance(resp.json, dict)
    assert "categories" in resp.json
    assert isinstance(resp.json["categories"], list)
    assert resp.json["categories"] == [{"id": 1, "name": "Fiction"}]
    assert "request_id" in resp.json


@patch(
    "api.services.categories_service.get_categories", side_effect=Exception("DB error")
)
def test_get_categories_failure(mock_get, client):
    resp = client.get("/api/categories")
    assert resp.status_code == 500
    assert "error" in resp.json


# More endpoint tests (books, my-books, etc.) would follow a similar pattern
