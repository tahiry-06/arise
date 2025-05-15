from flask import Blueprint
from app.controllers.controller_users import sign_in,sign_up

users = Blueprint('users', __name__)
@users.route('/signin', methods = ['GET', 'POST'])
def users_sign_in():
    return sign_in()
@users.route('/signup', methods = ['GET', 'POST'])
def users_sign_up():
    return sign_up()


   