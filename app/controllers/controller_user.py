from flask import request, jsonify, render_template, make_response
from app.services.error_handler import Error
from app.models.model_users import User

import bcrypt

def dashaboard():
    user = request.user
    
    if not user:
        raise Error(400, details = 'User not found.')
    # return jsonify({'user': user}), 200
    usr = User.objects(id = user['id']).first()

    return render_template('main-page.html', user=usr.to_dict())
    
def update():
    if request.method == 'PUT':
        data = request.get_json()
        user = request.user
        db_user = User.objects(id = user['id']).first()
        if not db_user:
            raise Error(400, details = 'User not found.')
        
        if data.get('password') is not None:
            # if user and not data['password'] == db_user.password:
            if user and not bcrypt.checkpw(data['password'].encode('utf-8'), db_user.password.encode('utf-8')):
                return jsonify({
                    'message': 'Incorrect password.',
                    'password_match': False
                    })
            
            hashed_new_password = bcrypt.hashpw(
                data['new_password'].encode('utf-8'),
                 bcrypt.gensalt()
            ).decode('utf-8')

            data['password'] = hashed_new_password
            del data['new_password']

        db_user.update(**data)
        # .reload() help the data to sync with the .to_dict()
        # like in JS when we would have used await
        db_user.reload()
        return jsonify({'message': f'{db_user.name}, here are your new infos','user': db_user.to_dict()}), 200

        
    elif request.method == 'GET':
        user = request.user
        if not user:
            raise Error(400, details = 'User not found.')
        return jsonify({'user': user}), 200
        
def delete():
    if request.method == 'DELETE':
        message = 'Account deleted successfully.'
        user = request.user
        db_user = User.objects(id = user['id']).first()
        if not user:
            # raise Error(400, details = 'User not found.')
            return jsonify({
                'message': 'User not found.'
            })
        db_user.delete()
        return make_response(jsonify({
            'message': f'User {db_user.username} deleted successfully',
            'redirectURL': f'/?message={message.replace(' ', '+')}'
            })), 200

def logout():

    message = 'Successfully logged out.'
    response = make_response(jsonify({
        'message': 'Successfully logged out.',
        'redirectURL': f'/?message={message.replace(' ', '+')}'
    }))
    response.set_cookie('access_token', '', expires=0, httponly=True, secure=True, samesite='Strict')
    response.set_cookie('refresh_token', '', expires=0, httponly=True, secure=True, samesite='Strict')
    return response