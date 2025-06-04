from flask import request, jsonify, g
from api.services import book_service, categories_service
from api.utils.logger_config import logger
from api.utils.authentication import login_required

def register_home_routes(app):
    logger.debug("Registering home routes")

    @app.route('/api/health', methods=['GET'])
    def index():
        logger.debug("api/health route accessed")
        return jsonify({"message": "API is running"}), 200
    
    
    @app.route('/api/me', methods=['GET'])
    @login_required
    def me():
        # Log user authetnication tokens
        logger.debug("api/me route accessed")

        user_id = g.get("user_id", None)
        user_jwt = g.get("user_jwt", None)
        refresh_token = g.get("refresh_token", None)

        logger.debug(f"User ID: {user_id}")
        logger.debug(f"User JWT: {user_jwt}")
        logger.debug(f"Refresh Token: {refresh_token}")

        if not user_id:
            logger.warning("User ID not found in request context")
            return jsonify({"error": "User not authenticated"}), 401
        return jsonify({
            "user_id": user_id,
            "user_jwt": user_jwt,
            "refresh_token": refresh_token
        }), 200
    
    @app.route('/api/categories', methods=['GET'])
    def get_categories():
        logger.debug("Get categories route accessed")

        try:
            categories = categories_service.get_categories()
            return jsonify(categories), 200
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return jsonify({"error": "Internal server error fetching categories"}), 500
    
    @app.route('/api/books', methods=['POST'])
    def create_book():
        logger.debug("Create book route accessed")

        try:
            data = request.json
            title = data.get("title")

            if not title:
                return jsonify({"error": "Description is required"}), 400

            user_id = g.get("user_id", None)
            user_jwt = g.get("user_jwt", None)
            refresh_token = g.get("refresh_token", None)

            book_id = book_service.create_book(
                title_txt=title,
                user_id=user_id,
                user_jwt=user_jwt,
                refresh_token=refresh_token
            )

            if book_id:
                return jsonify({"jobId": book_id}), 202
            else:
                return jsonify({"error": "Failed to initiate job creation"}), 500

        except ValueError as ve:
            logger.warning(f"Validation error creating job: {str(ve)}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            logger.error(f"Error creating job: {str(e)}")
            return jsonify({"error": "Internal server error creating job"}), 500
        
        
