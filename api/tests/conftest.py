import pytest
from flask import Flask
from api.index import app as flask_app

@pytest.fixture(scope='module')
def app():
    yield flask_app

@pytest.fixture(scope='module')
def client(app):
    return app.test_client()

# Example: Mock Supabase client fixture (to be expanded as needed)
@pytest.fixture(autouse=True)
def mock_supabase(monkeypatch):
    # Patch Supabase client creation to avoid real DB calls in unit tests
    monkeypatch.setattr('api.db.supabase_client.get_supabase_client', lambda *args, **kwargs: None)
    monkeypatch.setattr('api.db.supabase_client.get_supabase_admin_client', lambda *args, **kwargs: None)
    yield 