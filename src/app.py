"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime
from flask_jwt_extended import get_jwt, jwt_required
from api.models import db, User, BlockedTokenList
from flask_cors import CORS

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        "supports_credentials": True
    }
})

app.url_map.strict_slashes = False
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = BlockedTokenList.query.filter_by(jti=jti).first()
    return token is not None

@app.before_request
def check_user_blocked():
    # Excluir rutas de autenticación y estáticas
    if request.path.startswith('/api/auth') or request.path == '/':
        return
    
    try:
        # Solo verificar para rutas que requieren autenticación
        if request.path.startswith('/api/'):
            jwt_data = get_jwt()
            user_id = jwt_data.get('sub')
            if user_id:
                user = User.query.get(user_id)
                if user and user.is_blocked:
                    if user.blocked_until and user.blocked_until > datetime.utcnow():
                        return jsonify({
                            "msg": f"Usuario bloqueado. Razón: {user.block_reason}",
                            "blocked_until": user.blocked_until.isoformat()
                        }), 403
                    elif user.is_blocked and (not user.blocked_until or user.blocked_until <= datetime.utcnow()):
                        # Desbloquear automáticamente si el tiempo de bloqueo expiró
                        user.is_blocked = False
                        user.block_reason = None
                        user.blocked_until = None
                        db.session.commit()
    except Exception as e:
        # No hay JWT válido o otro error, continuar con la solicitud
        app.logger.debug(f"Error en check_user_blocked: {str(e)}")
        pass


# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
