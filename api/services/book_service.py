from api.db.supabase_client import get_supabase_client
from api.db.repositories.books_repository import BooksRepository
from api.utils.logger_config import logger
from typing import Optional, List, Dict, Any
from api.db.repositories.user_reading_progress_repository import (
    UserReadingProgressRepository,
)
from uuid import UUID
from datetime import datetime, timezone


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
    if limit > 50:  # Set a max limit to prevent abuse
        limit = 50

    try:
        supabase_client = get_supabase_client()
        params = {"page_num": page, "page_size": limit}
        result = supabase_client.rpc("get_discover_books_for_user", params).execute()

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
            return {
                "success": False,
                "status_code": 500,
                "message": "An internal error occurred.",
            }

        if result.get("error") == "already_exists":
            return {
                "success": False,
                "status_code": 409,
                "message": "This book is already in your library.",
            }

        return {"success": True, "status_code": 201, "data": result}

    except Exception as e:
        logger.error(f"Unexpected error in add_book_to_user_library service: {e}")
        return {
            "success": False,
            "status_code": 500,
            "message": "An unexpected server error occurred.",
        }


def get_user_library(user_id: UUID) -> Optional[Dict[str, List[Dict[str, Any]]]]:
    """
    Retrieves and organizes all books in a user's library by their reading status.

    Args:
        user_id: The ID of the authenticated user.

    Returns:
        A dictionary with keys 'reading', 'to_read', 'finished' each containing a list of books,
        or None if an error occurs.
    """
    try:
        supabase_client = get_supabase_client()
        progress_repo = UserReadingProgressRepository(supabase_client)

        all_books = progress_repo.fetch_books_for_user(user_id)
        if all_books is None:  # Check for a repository-level error
            return None

        # Initialize the structure for the response
        library = {
            "reading": [],
            "to_read": [],
            "finished": [],
            "abandoned": [],
        }

        # The data comes from repo already flattened, so just need to group it.
        for book in all_books:
            status = book.get("status")
            if status:
                library.get(status, []).append(book)

        return library

    except Exception as e:
        logger.error(f"Unexpected error in get_user_library service: {e}")
        return None

    except Exception as e:
        logger.error(f"Unexpected error in get_user_library service: {e}")
        return None


def update_user_book_progress(
    user_id: UUID,
    book_id: UUID,
    status: Optional[str] = None,
    progress: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Service layer logic to update book progress, handling business rules.

    Args:
        user_id: The ID of the authenticated user.
        book_id: The ID of the book to update.
        status: The new reading status.
        progress: The new progress percentage.

    Returns:
        A dictionary indicating the result of the operation.
    """
    if status is None and progress is None:
        return {
            "success": False,
            "status_code": 400,
            "message": "Either status or progress must be provided.",
        }

    updates = {}
    now = datetime.now(timezone.utc).isoformat()

    if status:
        valid_statuses = ["to_read", "reading", "finished", "abandoned"]
        if status not in valid_statuses:
            return {
                "success": False,
                "status_code": 400,
                "message": f"Invalid status. Must be one of {valid_statuses}.",
            }
        updates["status"] = status

        # Business logic for timestamps
        if status == "reading":
            updates["started_reading_at"] = now
        elif status == "finished":
            updates["finished_reading_at"] = now
            updates["progress_percentage"] = (
                100  # Automatically set progress to 100% on finish
            )

    if progress is not None:
        if not 0 <= progress <= 100:
            return {
                "success": False,
                "status_code": 400,
                "message": "Progress must be between 0 and 100.",
            }
        updates["progress_percentage"] = progress

    # Always update the last interaction timestamp
    updates["last_progress_update_at"] = now

    try:
        supabase_client = get_supabase_client()
        progress_repo = UserReadingProgressRepository(supabase_client)
        result = progress_repo.update_book_progress(user_id, book_id, updates)

        if result:
            return {"success": True, "status_code": 200, "data": result}
        else:
            return {
                "success": False,
                "status_code": 404,
                "message": "Book not found in your library.",
            }

    except Exception as e:
        logger.error(f"Unexpected error in update_user_book_progress service: {e}")
        return {
            "success": False,
            "status_code": 500,
            "message": "An unexpected server error occurred.",
        }
