from flask import jsonify, request, redirect, current_app, make_response, render_template
from app.services.error_handler import Error
from app.models.model_users import User
import datetime
import bcrypt
import jwt

def sign_in():
    if request.method == 'GET':
        # return jsonify({'message': 'Please enter your credentials to log in'}), 200
        return render_template('index.html')
    elif request.method == 'POST':
        data = request.get_json()
        if not data['username'] or not data['password']:
            # raise Error(400, details = 'All fields are mandatory!')
            return jsonify({'message': 'All fields are mandatory.'})
        user = User.objects(username = data['username']).first()
        if not user:
            return jsonify({'message': 'User not found.'})
            # raise Error(400, details = 'User not found.')
        if user and not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
             return jsonify({'message': 'Incorrect password.'})
            # raise Error(401, details = 'Incorrect password.')
        # Generate tokens
        expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=6)
        access_token = jwt.encode({
            'id': str(user.id),
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'exp': expiry
        }, current_app.config['SECRET_KEY'],algorithm='HS256')

        refresh_token = jwt.encode({
            'id': str(user.id),
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=6)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        # Save the token in front-end level
        # response = make_response(redirect(f'/user/{user.id}'))
        response = make_response(jsonify({
            'message': 'Successfully logged in.',
            # 'redirectURL': f'/user/{user.id}',
            'redirectURL': f'/user/d/stickies',
            'exp': int(expiry.timestamp())
            }))
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Strict')
        return response
    
def sign_up():
    if request.method == 'POST':
        data = request.get_json()
        if not data['name'] or not data['username'] or not data['email'] or not data['password']:
            # raise Error(400, details = "All fields are mandatory!")
            return jsonify({'message': 'All fields are mandatory.'})
        if User.objects(username = data['username']).first():
            # raise Error(400, details = "Username already exists.")
            return jsonify({'message': 'Username already exists.'})
        new_user = User(
            name = data['name'],
            username = data['username'],
            email = data['email'],
            password = data['password']
        )
        new_user.save()
        #Generate token
        access_token = jwt.encode({
            'id': str(new_user.id),
            'username': new_user.username,
            'name': new_user.name,
            'email': new_user.email,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=6)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        refresh_token = jwt.encode({
            'id': str(new_user.id),
            'username': new_user.username,
            'name': new_user.name,
            'email': new_user.email,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=6)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        #Save the response in the fornt-end level
        response = make_response(jsonify({
            'message': 'Successfully logged in.', 
            # 'redirectURL': f'/user/{new_user.id}' 
            'redirectURL': f'/commitments/{new_user['id']}' 
            }))
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Strict')
        return response
    
    elif request.method == "GET":
        return jsonify({'message': 'Welcome to To-do, fill all fields to create your account'}), 200