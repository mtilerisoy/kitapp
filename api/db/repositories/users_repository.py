# api/db/repositories/users_repository.py

from typing import Optional, Dict, Any
from uuid import UUID
from .base_repository import BaseRepository


class UsersRepository(BaseRepository):
    def __init__(self, db_client):
        super().__init__("profiles", db_client)

    def get_user_subscription_status(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Fetches a user's subscription status and related Stripe information.

        Args:
            user_id: The ID of the user.

        Returns:
            A dictionary with subscription data, or None on error.
        """
        if not self.client:
            self.logger.error("Supabase client is not initialized.")
            return None

        try:
            data, count = (
                self.client.table(self.table_name)
                .select(
                    "subscription_status, stripe_subscription_id, stripe_customer_id, subscription_updated_at"
                )
                .eq("id", str(user_id))
                .single()
                .execute()
            )

            # Supabase returns (data, count) tuple, where data[1] contains the actual records
            if data and len(data[1]) > 0:
                self.logger.info(
                    f"Fetched subscription status for user '{str(user_id)[:8]}'."
                )
                return data  # Return the first (and only) record

            self.logger.warning(
                f"User not found: {user_id}"
            )
            return None

        except Exception as e:
            return self._handle_supabase_error(
                e, f"get_user_subscription_status (user_id={user_id})"
            )

    def update_user_subscription(
        self, 
        user_id: UUID, 
        subscription_status: str,
        stripe_customer_id: Optional[str] = None,
        stripe_subscription_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates a user's subscription status and Stripe information.

        Args:
            user_id: The ID of the user.
            subscription_status: The new subscription status.
            stripe_customer_id: The Stripe customer ID.
            stripe_subscription_id: The Stripe subscription ID.

        Returns:
            The updated user record, or None on error.
        """
        if not self.client:
            self.logger.error("Supabase client is not initialized.")
            return None

        try:
            update_data = {
                "subscription_status": subscription_status,
                "subscription_updated_at": "now()"
            }

            if stripe_customer_id:
                update_data["stripe_customer_id"] = stripe_customer_id
            
            if stripe_subscription_id:
                update_data["stripe_subscription_id"] = stripe_subscription_id

            data, count = (
                self.client.table(self.table_name)
                .update(update_data)
                .eq("id", str(user_id))
                .execute()
            )

            if data and len(data[1]) > 0:
                self.logger.info(
                    f"Updated subscription status for user '{str(user_id)[:8]}' to '{subscription_status}'."
                )
                return data[1][0]

            self.logger.warning(
                f"User not found for subscription update: {user_id}"
            )
            return None

        except Exception as e:
            return self._handle_supabase_error(
                e, f"update_user_subscription (user_id={user_id})"
            )

    def get_user_by_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Fetches a user by their ID.

        Args:
            user_id: The ID of the user.

        Returns:
            The user record, or None on error.
        """
        if not self.client:
            self.logger.error("Supabase client is not initialized.")
            return None

        try:
            data, count = (
                self.client.table(self.table_name)
                .select("*")
                .eq("id", str(user_id))
                .single()
                .execute()
            )

            # Supabase returns (data, count) tuple, where data[1] contains the actual records
            if data and len(data[1]) > 0:
                self.logger.info(
                    f"Fetched user '{str(user_id)[:8]}'."
                )
                return data[1][0]  # Return the first (and only) record

            self.logger.warning(
                f"User not found: {user_id}"
            )
            return None

        except Exception as e:
            return self._handle_supabase_error(
                e, f"get_user_by_id (user_id={user_id})"
            ) 