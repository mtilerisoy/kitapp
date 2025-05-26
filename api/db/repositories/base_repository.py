from api.utils.logger_config import logger


class BaseRepository:
    def __init__(self, table_name: str, db_client):
        self.client = db_client
        self.table_name = table_name
        self.logger = logger

    def _handle_supabase_error(self, error, operation: str):
        self.logger.error(f"Supabase {operation} on table {self.table_name} error: {error}")

        return None
