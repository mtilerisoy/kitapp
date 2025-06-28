from api.db.supabase_client import get_supabase_client
from api.db.repositories.books_repository import BooksRepository
from api.utils.logger_config import logger
from typing import Optional, List, Dict, Any
from api.db.repositories.user_reading_progress_repository import UserReadingProgressRepository
from uuid import UUID

def get_discover_books(page: int, limit: int) -> Optional[List[Dict[str, Any]]]:
    """
    Fetches a paginated list of books for the discover page,
    including whether each book is in the current user's library.

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
        params = {'page_num': page, 'page_size': limit}
        result = supabase_client.rpc('get_discover_books_for_user', params).execute()
        
        books_data = result.data
        
        logger.info(f"Fetched {len(books_data)} books via RPC for page {page}.")
        return books_data
        
    except Exception as e:
        logger.error(f"Error in book service while calling RPC for discover books: {e}")
        return None
    
def add_book_to_user_library(user_id: UUID, book_id: UUID) -> Dict[str, Any]:
    """
    Service layer logic to add a book to a user's library.

    Args:
        user_id: The ID of the authenticated user.
        book_id: The ID of the book to add.

    Returns:
        A dictionary indicating the result of the operation.
    """
    try:
        supabase_client = get_supabase_client()
        progress_repo = UserReadingProgressRepository(supabase_client)
        
        result = progress_repo.add_book_for_user(user_id, book_id)

        if result is None:
            return {"success": False, "status_code": 500, "message": "An internal error occurred."}

        if result.get("error") == "already_exists":
            return {"success": False, "status_code": 409, "message": "This book is already in your library."}

        return {"success": True, "status_code": 201, "data": result}

    except Exception as e:
        logger.error(f"Unexpected error in add_book_to_user_library service: {e}")
        return {"success": False, "status_code": 500, "message": "An unexpected server error occurred."}