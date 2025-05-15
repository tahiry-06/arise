from flask import request, jsonify, current_app, redirect
from app.services.error_handler import Error
from functools import wraps
import jwt

def validate_token(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        access_token = request.cookies.get('access_token')
        if not access_token:
            raise Error(401, details='Missing access token.')
        try:
            data = jwt.decode(access_token, current_app.config['SECRET_KEY'], algorithms='HS256') 
            request.user = data
        except jwt.ExpiredSignatureError:
            # raise Error(401, details='Access token expired.')
            return redirect('/?message=You+need+to+log+in+again.', code=302)
        except jwt.InvalidTokenError:
            # raise Error(401, details='Invalid access token.')
            return redirect('/?message=You+need+to+log+in+again.', code=302)
        return f(*args, **kwargs)
    return wrapper