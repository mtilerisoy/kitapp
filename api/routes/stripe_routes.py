from flask import request, jsonify, g
from api.utils.logger_config import logger
from api.utils.authentication import login_required
from api.services import stripe_service

def register_stripe_routes(app):
    logger.debug("Registering Stripe routes")

    @app.route("/api/create-checkout-session", methods=["POST"])
    @login_required
    def create_checkout_session():
        """Create a Stripe checkout session for subscription"""
        try:
            user_id = g.get("user_id")
            if not user_id:
                return jsonify({
                    "error": {
                        "type": "AuthenticationError",
                        "message": "User not authenticated",
                        "code": "unauthorized",
                        "request_id": g.request_id,
                    }
                }), 401

            data = request.get_json()
            price_id = data.get('priceId')
            
            if not price_id:
                return jsonify({
                    "error": {
                        "type": "ValidationError",
                        "message": "Price ID is required",
                        "code": "missing_price_id",
                        "request_id": g.request_id,
                    }
                }), 400

            # Get the base URL for success and cancel URLs
            base_url = request.headers.get('Origin', 'http://localhost:3000')
            # TODO: Get user email from the user
            user_email = "mtilerisoy@gmail.com" #g.get("user_email", "")
            
            # Call the service layer
            result = stripe_service.create_checkout_session(
                user_id=user_id,
                price_id=price_id,
                base_url=base_url,
                user_email=user_email
            )

            if result["success"]:
                return jsonify({
                    "sessionId": result["sessionId"],
                    "request_id": g.request_id
                }), 200
            else:
                return jsonify(result["error"]), 400

        except Exception as e:
            logger.error(f"Unexpected error in create_checkout_session route: {str(e)} | Request ID: {g.request_id}")
            return jsonify({
                "error": {
                    "type": "InternalError",
                    "message": "Internal server error",
                    "code": "internal_error",
                    "request_id": g.request_id,
                }
            }), 500

    @app.route("/api/verify-payment", methods=["POST"])
    @login_required
    def verify_payment():
        """Verify payment and update user subscription status"""
        try:
            user_id = g.get("user_id")
            if not user_id:
                return jsonify({
                    "error": {
                        "type": "AuthenticationError",
                        "message": "User not authenticated",
                        "code": "unauthorized",
                        "request_id": g.request_id,
                    }
                }), 401

            data = request.get_json()
            session_id = data.get('sessionId')
            
            if not session_id:
                return jsonify({
                    "error": {
                        "type": "ValidationError",
                        "message": "Session ID is required",
                        "code": "missing_session_id",
                        "request_id": g.request_id,
                    }
                }), 400

            # Call the service layer
            result = stripe_service.verify_payment_and_update_subscription(
                user_id=user_id,
                session_id=session_id
            )

            if result["success"]:
                return jsonify({
                    "message": result["message"],
                    "subscription_status": result["subscription_status"],
                    "request_id": g.request_id
                }), 200
            else:
                return jsonify(result["error"]), 400

        except Exception as e:
            logger.error(f"Unexpected error in verify_payment route: {str(e)} | Request ID: {g.request_id}")
            return jsonify({
                "error": {
                    "type": "InternalError",
                    "message": "Internal server error",
                    "code": "internal_error",
                    "request_id": g.request_id,
                }
            }), 500

    @app.route("/api/subscription-status", methods=["GET"])
    @login_required
    def get_subscription_status():
        """Get current user's subscription status"""
        try:
            user_id = g.get("user_id")
            if not user_id:
                return jsonify({
                    "error": {
                        "type": "AuthenticationError",
                        "message": "User not authenticated",
                        "code": "unauthorized",
                        "request_id": g.request_id,
                    }
                }), 401

            # Call the service layer
            result = stripe_service.get_user_subscription_status(user_id=user_id)

            if result["success"]:
                return jsonify({
                    "subscription_status": result["subscription_status"],
                    "request_id": g.request_id
                }), 200
            else:
                return jsonify(result["error"]), 500

        except Exception as e:
            logger.error(f"Unexpected error in get_subscription_status route: {str(e)} | Request ID: {g.request_id}")
            return jsonify({
                "error": {
                    "type": "InternalError",
                    "message": "Internal server error",
                    "code": "internal_error",
                    "request_id": g.request_id,
                }
            }), 500 