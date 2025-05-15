from flask import jsonify, request,current_app, make_response
from app.services.error_handler import Error
import datetime
import jwt

def new_access_token():
    # check for refresh tokent first
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        raise Error(401, details='Missing refresh token.')
    
    try:
        # Generate a new access token
        user = jwt.decode(refresh_token, current_app.config['SECRET_KEY'], algorithms='HS256')

        expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=6)
        new_access_token = jwt.encode({
            'id': str(user['id']),
            'username': user['username'],
            'name': user['name'],
            'email': user['email'],
            'exp': expiry
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        # response = jsonify({'message': 'Access token refreshed.'})
        response = make_response( jsonify({'exp': int(expiry.timestamp())}))
        response.set_cookie('access_token', new_access_token, httponly=True, secure=True, samesite='Strict')

        return response, 200
    
    except jwt.ExpiredSignatureError:
        raise Error(401, details='Refresh token expired.')
    
    except jwt.InvalidTokenError:
        raise Error(401, details='Invalid refresh token.')