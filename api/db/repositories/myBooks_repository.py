from typing import Any, Dict, Optional
from uuid import UUID

from .base_repository import BaseRepository


class MyBooks(BaseRepository):
    def __init__(self, db_client):
        super().__init__("myBooks", db_client)

    def create(self, book_id: UUID, title: str, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Create a new book entry."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot create job description.")
            return None

        try:
            payload = {
                    "id": str(book_id),
                    "title": title,
            }

            if user_id is not None:
                payload["user_id"] = str(user_id)

            data, count = self.client.table(self.table_name).insert(payload).execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Created job description with ID: {data[1][0]['id']}. User ID: {user_id if user_id else 'Anonymous'}")
                return data[1][0]

            self.logger.warning(f"No data returned after inserting job description: {title}")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, "create")

    def get_by_id(self, book_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a job description by its ID."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot get job description.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .select("*")\
                .eq("id", book_id)

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Retrieved job description with ID: {book_id}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {book_id}")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"get_by_id ({book_id})")

    def update_title(self, book_id: UUID, job_title: str):
        """Update the title of a job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot update job description title.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .update({"title": job_title})\
                .eq("id", book_id)

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Updated job description with ID: {book_id} to title: {job_title}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {book_id} to update title.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"update_title ({book_id})")
    
    def get_book_details(self) -> Optional[Dict[str, Any]]:
        """Get all job descriptions for the authenticated user."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot get job descriptions.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .select("*")\
                .order("created_at", desc=True)

            data, count = query.execute()

            records = data[1] if data and len(data) > 1 else []
            if records:
                self.logger.info(f"Retrieved {len(records)} job descriptions.")
                return data

            self.logger.warning("No job descriptions found.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, "get_all")
