# api/db/supabase_client.py

import os
from uuid import UUID

from flask import g
from supabase import create_client, Client
from dotenv import load_dotenv
from api.utils.logger_config import logger

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    logger.error("Supabase URL or Anon Key not found in environment variables.")


def get_supabase_client(user_jwt: str = None, refresh_token: str = None) -> Client:

    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Supabase client created successfully.")

        try:
            if user_jwt is None:
                user_jwt = g.get("user_jwt", None)

            if refresh_token is None:
                refresh_token = g.get("refresh_token", None)

        except RuntimeError:
            logger.warning(
                "Flask g context not available. User JWT and refresh token will not be set."
            )

        if user_jwt and refresh_token:
            supabase_client.auth.set_session(
                access_token=user_jwt, refresh_token=refresh_token
            )
            logger.info(
                "Supabase client authenticated with user JWT and refresh token."
            )
        else:
            logger.info(
                "No user JWT found. Supabase client created without authentication."
            )

        return supabase_client

    except Exception as e:
        logger.error(f"Error creating Supabase client: {e}")
        raise


def get_supabase_admin_client() -> Client:
    """
    Creates a Supabase client with full admin privileges using the service role key.
    This client BYPASSES all Row-Level Security policies.
    Use with caution and only for trusted server-side operations like creating signed URLs
    or performing administrative tasks.
    """
    if not SUPABASE_SERVICE_KEY:
        logger.error(
            "SUPABASE_SERVICE_ROLE_KEY is not configured. Cannot create admin client."
        )
        raise ValueError("Service role key is not configured.")

    try:
        supabase_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase admin client created successfully.")
        return supabase_admin_client
    except Exception as e:
        logger.error(f"Error creating Supabase admin client: {e}")
        raise
