"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS

from flask_jwt_extended import create_access_token #Importamos las librerias necesarias.
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from datetime import timedelta #Importamos "timedelta" de datetime para modificar el tiempo de expiración de nuestro token.
from flask_bcrypt import Bcrypt

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__) #Recuerda instanciar Flask.
CORS(app)
app.url_map.strict_slashes = False
#Seteamos la configuración para la creación de tokens e instanciamos JWT( siempre debajo de flask).
app.config["JWT_SECRET_KEY"] = os.getenv("JWT-KEY") #Método para traer variables.
jwt = JWTManager(app)
#Seteamos el Bcrypt(siempre debajo de flask(__name__)
bcrypt = Bcrypt(app)


db_url = os.getenv("DATABASE_URL") #Método para traer variables.
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

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

@app.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Es necesario rellenar los campos'}), 400
    if 'email' not in body:
        
        
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'El campo password es obligatorio'}), 400
    
    user = User.query.filter_by(email=body['email']).first()  #Buscamos un usuario que su email coincida con el se envió en el body.
    if user is None: #Si no se encontró nigún usuario con ese correo devolvemos el siguiente mensaje.
        return jsonify({'msg': 'User o password inválidos'}), 400
    password_db = user.password #Si el usuario fue encontrado accedemos a la contraseña almacenada en la BD para ese usuario.
    #Usa bcrypt.check_password_hash para comparar la contraseña almacenada en la base de datos (password_db), que está en forma de un hash (una cadena encriptada) con la contraseña ingresada por el usuario (body['password']) con 
    password_is_true = bcrypt.check_password_hash(password_db, body['password'])
    if password_is_true is False: #Si la contraseña que envío el usuario NO ES IGUAL a la que está en el body
        return jsonify({'msg': 'User o password inválidos'}), 400
    #Creamos el token, modificamos la fecha de expiración(hay que importar "timedelta") y lo retornamos.
    expires = timedelta(hours=2) #Fecha de expiración.
    access_token = create_access_token(identity = user.email, expires_delta=expires) #Le pasamos la configuración del tiempo de expiración.
    return jsonify ({'msg': 'ok',
             'jwt_token': access_token}), 200 

@app.route('/private', methods=['GET'])
@jwt_required()#Requerimiento del token.
def get_private_info():
     #Trae la información con la que se firmó la manilla(trae el email porque fue el que usamos para crear el token).
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    # Verificamos si el usuario existe en la base de datos.
    if user is None:
        return jsonify({'msg': 'Usuario no registrado'}), 401
    
    return jsonify ({'email': current_user}), 200

@app.route('/signup', methods=['POST'])
def register():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Es necesario rellenar los campos'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'El campo password es obligatorio'}), 400
    user = User.query.filter_by(email=body['email']).first()
    if user:
        return jsonify({"msg": "El usuario ya existe"}), 400
    
    pw_hash = bcrypt.generate_password_hash(body['password']).decode('utf-8') #Encriptamos la contraseña(hay que importar primero).
    new_user = User() #Instanciamos un nuevo usuario.
    new_user.email = body['email']
    new_user.password = pw_hash #contraseña encriptada.
    new_user.is_active = True
    db.session.add(new_user) #Agregamos el nuevo usuario.
    db.session.commit() #Guardamos el nuevo usuario.
    return jsonify({'msg': 'Nuevo usuario creado'}), 201


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
