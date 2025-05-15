from .services.error_handler import error_handler
from .routes import users, user, refresh, todos, stickies, commitments
from app.db.database import connect_db
from dotenv import load_dotenv
from flask import Flask
import os

def create_app():
    # load variables from .env
    load_dotenv()

    app = Flask(__name__)
    error_handler(app)
    # access the secret key from .env
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    db = connect_db()
    app.register_blueprint(users, url_prefix='/users')
    app.register_blueprint(todos, url_prefix='/user')
    app.register_blueprint(stickies, url_prefix='/user/d')
    app.register_blueprint(refresh, url_prefix='/')
    app.register_blueprint(user, url_prefix='/')
    app.register_blueprint(commitments, url_prefix='/')



    return app, db

