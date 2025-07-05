from flask import Flask

from api.utils.authentication import auth_context_processor
from api.routes.home_routes import register_home_routes


app = Flask(__name__)
app.before_request(auth_context_processor)

register_home_routes(app)

if __name__ == "__main__":
    app.run(debug=True)
