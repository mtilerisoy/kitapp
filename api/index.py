from flask import Flask, g, request, jsonify
import os
import uuid
import traceback

from api.utils.authentication import auth_context_processor
from api.routes.home_routes import register_home_routes


app = Flask(__name__)
app.before_request(auth_context_processor)


@app.before_request
def add_request_id():
    g.request_id = str(uuid.uuid4())


@app.errorhandler(Exception)
def handle_global_exception(e):
    from api.utils.logger_config import logger

    tb = traceback.format_exc()
    logger.error(
        f"Unhandled Exception: {e}\nTraceback:\n{tb}\nRequest: {request.method} {request.path} | Request ID: {getattr(g, 'request_id', None)}"
    )
    response = {
        "error": {
            "type": e.__class__.__name__,
            "message": str(e),
            "code": "internal_server_error",
            "request_id": getattr(g, "request_id", None),
        }
    }
    return jsonify(response), 500


register_home_routes(app)

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug_mode)
