from unittest.mock import patch, MagicMock
from api.services import book_service, categories_service


@patch("api.services.book_service.get_supabase_client")
def test_get_discover_books_success(mock_client):
    mock_rpc = MagicMock()
    mock_rpc.rpc.return_value.execute.return_value.data = [{"id": 1, "title": "Book"}]
    mock_client.return_value = mock_rpc
    books = book_service.get_discover_books(1, 10)
    assert isinstance(books, list)
    assert books[0]["title"] == "Book"


@patch("api.services.book_service.get_supabase_client")
def test_get_discover_books_empty(mock_client):
    mock_rpc = MagicMock()
    mock_rpc.rpc.return_value.execute.return_value.data = []
    mock_client.return_value = mock_rpc
    books = book_service.get_discover_books(1, 10)
    assert books == []


@patch(
    "api.services.book_service.get_supabase_client", side_effect=Exception("RPC error")
)
def test_get_discover_books_failure(mock_client):
    books = book_service.get_discover_books(1, 10)
    assert books is None


@patch("api.services.categories_service.get_supabase_client")
@patch("api.services.categories_service.Categories")
def test_get_categories_success(mock_categories, mock_client):
    mock_repo = MagicMock()
    mock_repo.fetch_all.return_value = (None, [{"id": 1, "name": "Fiction"}])
    mock_categories.return_value = mock_repo
    cats = categories_service.get_categories()
    assert isinstance(cats, list)
    assert cats[0]["name"] == "Fiction"


@patch(
    "api.services.categories_service.get_supabase_client",
    side_effect=Exception("DB error"),
)
@patch("api.services.categories_service.Categories")
def test_get_categories_failure(mock_categories, mock_client):
    mock_repo = MagicMock()
    mock_repo.fetch_all.side_effect = Exception("DB error")
    mock_categories.return_value = mock_repo
    cats = categories_service.get_categories()
    assert cats is None
