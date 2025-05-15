# this route will get new access token once old one has expired

from app.controllers.controller_token import new_access_token
from flask import Blueprint

refresh = Blueprint('refresh', __name__)

@refresh.route('/token/refresh', methods=['POST'])
def refresh_token():
    return new_access_token()