from typing import Any, Dict, Optional, List
from .base_repository import BaseRepository


class BooksRepository(BaseRepository):
    def __init__(self, db_client):
        super().__init__("books", db_client)

    def fetch_paginated_books(self, page: int, limit: int) -> Optional[List[Dict[str, Any]]]:
        """
        Fetches a paginated list of books.

        Args:
            page (int): The page number to fetch (1-indexed).
            limit (int): The number of books per page.

        Returns:
            A list of book dictionaries, or None if an error occurs.
        """
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot fetch books.")
            return None

        try:
            # Calculate the offset for pagination.
            # Page 1 should have an offset of 0.
            offset = (page - 1) * limit

            # UPDATE: Added 'author' to the select query.
            query = self.client.table(self.table_name)\
                .select("id, title, author, cover_image_url")\
                .order("created_at", desc=True)\
                .range(offset, offset + limit - 1)

            data, count = query.execute()

            # The result from execute() is a tuple (data, count). We need the list from data[1].
            records = data[1] if data and len(data) > 1 else []

            if records:
                self.logger.info(f"Retrieved {len(records)} books for page {page} with limit {limit}.")
            else:
                self.logger.info(f"No books found for page {page} with limit {limit}.")

            return records

        except Exception as e:
            return self._handle_supabase_error(e, f"fetch_paginated_books (page={page}, limit={limit})")