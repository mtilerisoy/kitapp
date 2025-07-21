# api/services/stripe_service.py

import os
import stripe
from typing import Optional, Dict, Any
from uuid import UUID
from flask import g
from api.utils.logger_config import logger
from api.db.supabase_client import get_supabase_admin_client
from api.db.repositories.users_repository import UsersRepository

# Initialize Stripe with secret key
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
stripe_price_id = os.environ.get("STRIPE_PRICE_ID")


def create_checkout_session(
    user_id: UUID, price_id: str, base_url: str, user_email: str
) -> Dict[str, Any]:
    """
    Creates a Stripe checkout session for subscription.

    Args:
        user_id: The ID of the user.
        price_id: The Stripe price ID for the subscription.
        base_url: The base URL for success/cancel redirects.
        user_email: The user's email address.

    Returns:
        A dictionary with the session ID or error information.
    """
    try:
        # Create Stripe checkout session

        checkout_session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[
                {
                    "price": stripe_price_id,
                    "quantity": 1,
                }
            ],
            success_url=f"{base_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base_url}/subscription/cancel",
            automatic_tax={"enabled": True},
        )

        logger.info(
            f"Created checkout session for user {user_id} | Request ID: {getattr(g, 'request_id', None)}"
        )

        return {"success": True, "sessionId": checkout_session.id}

    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe error in create_checkout_session: {str(e)} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "error": {
                "type": "StripeError",
                "message": "Payment processing error",
                "code": "stripe_error",
                "request_id": getattr(g, "request_id", None),
            },
        }
    except Exception as e:
        logger.error(
            f"Unexpected error in create_checkout_session: {str(e)} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "error": {
                "type": "InternalError",
                "message": "Internal server error",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            },
        }


def verify_payment_and_update_subscription(
    user_id: UUID, session_id: str
) -> Dict[str, Any]:
    """
    Verifies a payment and updates the user's subscription status.

    Args:
        user_id: The ID of the user.
        session_id: The Stripe checkout session ID.

    Returns:
        A dictionary with success status or error information.
    """
    try:
        # Retrieve the checkout session from Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id)

        # Verify the session belongs to the authenticated user
        if checkout_session.metadata.get("user_id") != str(user_id):
            return {
                "success": False,
                "error": {
                    "type": "AuthorizationError",
                    "message": "Session does not belong to user",
                    "code": "unauthorized_session",
                    "request_id": getattr(g, "request_id", None),
                },
            }

        # Check if payment was successful
        if checkout_session.payment_status != "paid":
            return {
                "success": False,
                "error": {
                    "type": "PaymentError",
                    "message": "Payment not completed",
                    "code": "payment_incomplete",
                    "request_id": getattr(g, "request_id", None),
                },
            }

        # Update user subscription status in database
        supabase_admin = get_supabase_admin_client()
        users_repo = UsersRepository(supabase_admin)

        update_result = users_repo.update_user_subscription(
            user_id=user_id,
            subscription_status="active",
            stripe_customer_id=checkout_session.customer,
            stripe_subscription_id=checkout_session.subscription,
        )

        if update_result:
            logger.info(
                f"Updated subscription status for user {user_id} | Request ID: {getattr(g, 'request_id', None)}"
            )

            return {
                "success": True,
                "message": "Payment verified and subscription activated",
                "subscription_status": "active",
            }
        else:
            logger.error(
                f"Failed to update subscription status for user {user_id} | Request ID: {getattr(g, 'request_id', None)}"
            )
            return {
                "success": False,
                "error": {
                    "type": "DatabaseError",
                    "message": "Failed to update subscription status",
                    "code": "update_failed",
                    "request_id": getattr(g, "request_id", None),
                },
            }

    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe error in verify_payment_and_update_subscription: {str(e)} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "error": {
                "type": "StripeError",
                "message": "Payment verification error",
                "code": "stripe_error",
                "request_id": getattr(g, "request_id", None),
            },
        }
    except Exception as e:
        logger.error(
            f"Unexpected error in verify_payment_and_update_subscription: {str(e)} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "error": {
                "type": "InternalError",
                "message": "Internal server error",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            },
        }


def get_user_subscription_status(user_id: UUID) -> Dict[str, Any]:
    """
    Gets the current user's subscription status with Stripe verification.

    Args:
        user_id: The ID of the user.

    Returns:
        A dictionary with subscription status or error information.
    """
    try:
        # Get user's subscription status from database
        supabase_admin = get_supabase_admin_client()
        users_repo = UsersRepository(supabase_admin)

        subscription_data = users_repo.get_user_subscription_status(user_id)

        if subscription_data:
            # If user has an active subscription, verify with Stripe
            if subscription_data[0] == "active" and subscription_data[1]:
                try:
                    subscription = stripe.Subscription.retrieve(subscription_data[1])
                    is_active = subscription.status == "active"

                    if not is_active:
                        # Update database if subscription is no longer active
                        users_repo.update_user_subscription(
                            user_id=user_id, subscription_status="inactive"
                        )
                        subscription_data[0] = "inactive"
                except stripe.error.StripeError:
                    # If we can't verify with Stripe, assume inactive
                    subscription_data[0] = "inactive"

            return {"success": True, "subscription_status": subscription_data[0]}
        else:
            return {"success": True, "subscription_status": "inactive"}

    except Exception as e:
        logger.error(
            f"Error getting subscription status: {str(e)} | Request ID: {getattr(g, 'request_id', None)}"
        )
        return {
            "success": False,
            "error": {
                "type": "InternalError",
                "message": "Internal server error",
                "code": "internal_error",
                "request_id": getattr(g, "request_id", None),
            },
        }
