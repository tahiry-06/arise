from app.controllers.controller_user import dashaboard, delete, update, logout
from app.middlewares.middleware_token import validate_token
from flask import Blueprint


user = Blueprint('user', __name__)

@user.route('/user/<user_id>', methods = ["GET"])
@validate_token
def user_main(user_id):
    return dashaboard()

@user.route('/edit/<user_id>', methods = ["PUT", "GET"])
@validate_token
def user_edit(user_id):
    return update()
    
@user.route('/delete/<user_id>', methods = ["DELETE"])
@validate_token
def user_delete(user_id):
    return delete()

@user.route('/logout/<user_id>', methods = ['POST'])
@validate_token
def user_logout(user_id):
    return logout()