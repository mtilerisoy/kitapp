from flask import g
from api.utils.logger_config import logger

def register_home_routes(app):
    logger.debug("Registering home routes")

    @app.route('/api')
    def index():
        logger.debug("API index route accessed")
        return "<p>Welcome to the API!</p>"
    
    @app.route('/api/dashboard', methods=['GET'])
    def dashboard():
        # Log user authetnication tokens
        logger.debug("Auth check route accessed")

        user_id = g.get("user_id", None)
        user_jwt = g.get("user_jwt", None)
        refresh_token = g.get("refresh_token", None)

        logger.debug(f"User ID: {user_id}")
        logger.debug(f"User JWT: {user_jwt}")
        logger.debug(f"Refresh Token: {refresh_token}")
