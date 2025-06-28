from api.db.supabase_client import get_supabase_client
from api.db.repositories.books_repository import BooksRepository
from api.utils.logger_config import logger
from typing import Optional, List, Dict, Any

def get_discover_books(page: int, limit: int) -> Optional[List[Dict[str, Any]]]:
    """
    Fetches a paginated list of books for the discover page.

    Args:
        page (int): The page number to fetch.
        limit (int): The number of books per page.

    Returns:
        A list of books or None if an error occurs.
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 50: # Set a max limit to prevent abuse
        limit = 50

    try:
        supabase_client = get_supabase_client()
        books_repo = BooksRepository(supabase_client)
        books_data = books_repo.fetch_paginated_books(page=page, limit=limit)
        return books_data
    except Exception as e:
        logger.error(f"Error in book service while getting discover books: {e}")
        return None