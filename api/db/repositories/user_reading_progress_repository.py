# api/db/repositories/user_reading_progress_repository.py

from typing import Optional
from uuid import UUID
from .base_repository import BaseRepository
from psycopg2 import errors

UniqueViolation = errors.lookup('23505')

class UserReadingProgressRepository(BaseRepository):
    def __init__(self, db_client):
        super().__init__("user_reading_progress", db_client)

    def add_book_for_user(self, user_id: UUID, book_id: UUID) -> Optional[dict]:
        """
        Adds a book to a user's reading list.
        Defaults the status to 'to_read'.

        Args:
            user_id: The ID of the user.
            book_id: The ID of the book to add.

        Returns:
            The created record, None on generic error, or a dict with an 'error' key
            for specific known issues like a unique constraint violation.
        """
        if not self.client:
            self.logger.error("Supabase client is not initialized.")
            return None

        try:
            # The 'user_reading_progress' table has a composite primary key on (user_id, book_id).
            # This INSERT will fail if the user already has the book, which is what we want.
            data, count = self.client.table(self.table_name).insert({
                'user_id': str(user_id),
                'book_id': str(book_id),
                'status': 'to_read' # Default status when adding
            }).execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"User '{str(user_id)[:8]}' added book '{str(book_id)[:8]}' to their library.")
                return data[1][0]

            self.logger.warning(f"Insert operation did not return data for user {user_id} and book {book_id}.")
            return None

        except Exception as e:
            if isinstance(e.args[0], UniqueViolation):
                self.logger.warning(f"User '{str(user_id)[:8]}' already has book '{str(book_id)[:8]}'.")
                return {"error": "already_exists"}
            # For other errors, use the generic handler
            return self._handle_supabase_error(e, f"add_book_for_user (user_id={user_id}, book_id={book_id})")