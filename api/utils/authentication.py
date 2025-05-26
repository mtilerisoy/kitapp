import jwt
import os

from typing import Optional
from uuid import UUID
from dotenv import load_dotenv
from jwt import ExpiredSignatureError, InvalidTokenError
from functools import wraps
from flask import request, g, jsonify

from api.utils.logger_config import logger

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def login_required(func):
    """
    Decorator for routes that require authentication.
    Ensures a valid user is present, otherwise returns 401.
    """

    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not g.get("user_id"):
            logger.warning("Unauthorized access attempt.")
            return jsonify({"error": "Authentication required"}), 401
        return func(*args, **kwargs)

    return decorated_function


def auth_context_processor():
    """
    Sets g.user_id, g.user_jwt, g.refresh_token based on request headers.
    To be called via @app.before_request.
    """

    # Initialize g attributes
    g.user_id = None
    g.user_jwt = None
    g.refresh_token = None

    # Parse headers and sets on g
    get_current_user()


def get_current_user() -> Optional[UUID]:
    """
    Checks for an Authorization: Bearer token and validates it.
    Returns the user_id if valid, otherwise None.
    Stores the user_id in Flask's request context `g` if found.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        logger.warning("Authorization header is missing. No user is authenticated.")
        return None

    if not auth_header.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise ValueError("Invalid authorization header format")

    token = auth_header.split(" ")[1]

    g.user_jwt = token  # Store the token in Flask's g context for later use

    # Store refresh token
    refresh_token = request.headers.get("refresh-token", None)
    if not refresh_token:
        logger.warning("Refresh token is missing")

    g.refresh_token = refresh_token

    user_id = validate_token_and_get_user_id(token)

    g.user_id = user_id  # Store the user_id in Flask's g context
    return user_id


def validate_token_and_get_user_id(token: str) -> Optional[UUID]:
    if not SUPABASE_JWT_SECRET:
        logger.error("SUPABASE_JWT_SECRET is not configured.")
        return None

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience="authenticated",
        )
        user_id = payload.get('sub')

        if not user_id:
            logger.warning("User ID (sub claim) not found in token payload.")
            return None

        logger.info(f"User ID extracted from token: {user_id[:8]}...")
        return UUID(user_id)

    except ExpiredSignatureError:
        logger.warning("Token has expired.")
        return None
    except InvalidTokenError as e:  # errors like invalid signature, malformed token etc.
        masked_token = f"{token[:5]}...{token[-5:]}" if len(token) > 10 else token
        logger.warning(f"Invalid token: {e}. Received {masked_token}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred during token processing: {e}")
        return None
