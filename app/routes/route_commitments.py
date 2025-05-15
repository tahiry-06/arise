from flask import Blueprint, render_template, request
from app.middlewares.middleware_token import validate_token

commitments = Blueprint('commitments', __name__)

@commitments.route('/commitments/<user_id>')
@validate_token
def commit(user_id):
    user = request.user
    return render_template('commitment.html')