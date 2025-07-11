from api.db.supabase_client import get_supabase_client
from api.utils.logger_config import logger
from typing import Optional, List, Dict, Any
from api.db.repositories.user_reading_progress_repository import (
    UserReadingProgressRepository,
)
from uuid import UUID
from flask import g


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
    Returns a dict with standardized error format on failure.
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
                "error": {
                    "type": "ServiceError",
                    "message": "An internal error occurred.",
                    "code": "add_book_error",
                    "request_id": getattr(g, "request_id", None),
                },
            }
        if result.get("error") == "already_exists":
            return {
                "success": False,
                "status_code": 409,
                "message": "This book is already in your library.",
                "error": {
                    "type": "ConflictError",
                    "message": "This book is already in your library.",
                    "code": "already_exists",
                    "request_id": getattr(g, "request_id", None),
                },
            }
        return {"success": True, "status_code": 201, "data": result}
    except Exception as e:
        logger.error(
            f"Unexpected error in add_book_to_user_library service: {e} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "status_code": 500,
            "message": "An unexpected server error occurred.",
            "error": {
                "type": "InternalServerError",
                "message": "An unexpected server error occurred.",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            },
        }


def get_user_library(user_id: UUID) -> Optional[Dict[str, List[Dict[str, Any]]]]:
    """
    Retrieves and organizes all books in a user's library by their reading status.
    Returns None or a dict with standardized error format on failure.
    """
    try:
        supabase_client = get_supabase_client()
        progress_repo = UserReadingProgressRepository(supabase_client)
        all_books = progress_repo.fetch_books_for_user(user_id)
        if all_books is None:
            return {
                "error": {
                    "type": "ServiceError",
                    "message": "Failed to retrieve user library.",
                    "code": "get_library_error",
                    "request_id": getattr(g, "request_id", None),
                }
            }
        library: Dict[str, List[Dict[str, Any]]] = {
            "reading": [],
            "to_read": [],
            "finished": [],
            "abandoned": [],
        }
        for book in all_books:
            status = book.get("status")
            if status:
                library.get(status, []).append(book)
        return library
    except Exception as e:
        logger.error(
            f"Unexpected error in get_user_library service: {e} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "error": {
                "type": "InternalServerError",
                "message": "An unexpected server error occurred.",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            }
        }


def update_user_book_progress(
    user_id: UUID,
    book_id: UUID,
    status: Optional[str] = None,
    progress: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Updates a user's reading progress for a specific book.
    Returns a dict with standardized error format on failure.
    """
    try:
        supabase_client = get_supabase_client()
        progress_repo = UserReadingProgressRepository(supabase_client)
        updates = {}
        if status is not None:
            updates["status"] = status
        if progress is not None:
            updates["progress_percentage"] = progress
        result = progress_repo.update_book_progress(user_id, book_id, updates)
        if result:
            return {"success": True, "status_code": 200, "data": result}
        else:
            return {
                "success": False,
                "status_code": 404,
                "message": "Book not found in your library.",
                "error": {
                    "type": "NotFoundError",
                    "message": "Book not found in your library.",
                    "code": "book_not_found",
                    "request_id": getattr(g, "request_id", None),
                },
            }
    except Exception as e:
        logger.error(
            f"Unexpected error in update_user_book_progress service: {e} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "status_code": 500,
            "message": "An unexpected server error occurred.",
            "error": {
                "type": "InternalServerError",
                "message": "An unexpected server error occurred.",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            },
        }
