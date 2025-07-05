import pytest
from unittest.mock import MagicMock
from api.db.repositories.books_repository import BooksRepository
from api.db.repositories.categories_repository import Categories

@pytest.fixture
def mock_db_client():
    return MagicMock()

def test_books_repository_fetch_paginated_books_success(mock_db_client):
    repo = BooksRepository(mock_db_client)
    mock_db_client.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value = ([None, [{'id': 1, 'title': 'Book'}]], None)
    books = repo.fetch_paginated_books(1, 10)
    assert isinstance(books, list)
    assert books[0]['title'] == 'Book'

def test_books_repository_fetch_paginated_books_no_client():
    repo = BooksRepository(None)
    assert repo.fetch_paginated_books(1, 10) is None

def test_categories_repository_fetch_all_success(mock_db_client):
    repo = Categories(mock_db_client)
    mock_db_client.table.return_value.select.return_value.order.return_value.execute.return_value = ([None, [{'id': 1, 'name': 'Fiction'}]], None)
    cats = repo.fetch_all()
    assert cats[1][0]['name'] == 'Fiction'

def test_categories_repository_fetch_all_no_client():
    repo = Categories(None)
    assert repo.fetch_all() is None 