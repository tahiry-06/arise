from flask import request, jsonify, make_response

from app.models.model_stickies import Sticky
from app.models.model_users import User
from app.services.error_handler import Error

from datetime import datetime, timezone, timedelta
import pytz  # 🔥 Make sure this is imported

def stickies__():
    if request.method == 'GET':
        user = request.user
        tz = request.args.get('timezone', 'UTC')

        stickies_data = Sticky.objects(user=user['id'])
        sticky_list = []

        # print(type(tz))
        if tz != 'UTC':
            # 🔥 ADDED: Convert current time to user's timezone
            try:
                user_tz = pytz.timezone(tz)
            except pytz.UnknownTimeZoneError:
                user_tz = pytz.UTC

            now_in_tz = datetime.now(user_tz).date()

            # 🔥 ADDED: Reset logic before returning data
            for item in stickies_data:
                # print('Print timezones before reset.\nLast reset,', item.last_reset,'\nNow,', now_in_tz)
                if item.last_reset != now_in_tz:
                    if item.completed:
                        item.completion_count += 1
                    item.completed = False
                    item.last_reset = now_in_tz
                    item.save()

                sticky_list.append(item.to_dict())
        


        if not stickies_data:
            return make_response(jsonify({
                'message': "You probably don't have any sticky yet.",
                'stickies': sticky_list,
                'redirectURL': f'/commitments/{user["id"]}'  # 🔥 fixed quote issue here too
            }), 200)
        
        usr = User.objects(id=user['id']).first()
        
        return make_response(jsonify({
            'stickies': sticky_list,
            'user': usr.to_dict(),
            'redirectURL': f'/user/{user["id"]}'  # 🔥 fixed quote issue
        }), 200)

    elif request.method == 'POST':
        user = request.user
        data = request.get_json()

        if not data['content'] or not data['category']:
            raise Error(400, details='Provide content and category for the sticky.')

        new_sticky = Sticky(
            content=data['content'],
            category=data['category'],
            user=user['id'],
            last_reset=datetime.now(timezone.utc).date()  # 🔥 ADDED: initialize last_reset
        )
        new_sticky.save()

        return make_response(jsonify({
            'message': 'A new sticky is updated',
            'sticky': new_sticky.to_dict(),
            'redirectURL': f'/user/{user["id"]}'
        }))


# def sticky_done():
#     sticky_id = request.view_args.get('sticky_id')
#     sticky = Sticky.objects(id=sticky_id).first()
#     if not sticky:
#         raise Error(400, details = 'Sticky not found.')
    
#     # data = request.get_json()
    
#     sticky.completed = not sticky.completed
#     sticky.save()
#     return make_response(jsonify({
#             'message': 'A sticky is successfully marked as done.', 
#             'sticky': sticky.to_dict()
#         }))

def sticky_done():
    usr = request.user  # 🔥 make sure request.user is available
    user = User.objects(id=usr['id']).first()
    sticky_id = request.view_args.get('sticky_id')
    sticky = Sticky.objects(id=sticky_id).first()

    if not sticky:
        raise Error(400, details='Sticky not found.')

    # 🔥 Only track streak if marking it as done (not undone)
    if not sticky.completed:
        # Get user's timezone or default to UTC
        user_tz_str = request.args.get('timezone', 'UTC')
        try:
            user_tz = pytz.timezone(user_tz_str)
        except pytz.UnknownTimeZoneError:
            user_tz = pytz.UTC

        today = datetime.now(user_tz).date()

        # Compare with user's last active date
        if user.last_active_date == today - timedelta(days=1):
            user.streak_count += 1
        elif user.last_active_date != today:
            user.streak_count = 1  # Reset streak
        # else: same day, don't increase

        user.last_active_date = today
        user.save()

    # Toggle completion
    sticky.completed = not sticky.completed
    sticky.save()

    return make_response(jsonify({
        'message': 'A sticky is successfully marked as done.',
        'sticky': sticky.to_dict(),
        'streak': user.streak_count  # 🔥 Optional: send back streak for frontend
    }))



def sticky_edit():
    if request.method == 'PUT':
        sticky_id = request.view_args.get('sticky_id')
        sticky = Sticky.objects(id=sticky_id).first()
        data = request.get_json()
        if not sticky:
            raise Error(400, details = 'To-do not found.')
        # this was a reset test but we will need this in the future
        # data['completed'] = False
        sticky.update(**data)
        sticky.reload()

        
        return make_response(jsonify({
            'message': 'A sticky have been successfully updated.', 
            'sticky': sticky.to_dict()
        }))
    

# def reset_stickies():
#     user = request.user
#     data = request.get_json()
#     user_timezone = data.get('timezone', 'UTC') 

#     if not user:
#         return jsonify({'error': 'User ID is required'}), 400
    
#     # Localize to user timezone
#     now = datetime.now(pytz.timezone(user_timezone)).date()

#     # Get all user's stickies
#     stickies = Sticky.objects(user=user['id'])

#     for sticky in stickies:
#         if sticky.last_reset != now:
#             if sticky.completed:
#                 sticky.completion_count += 1  # only increase if it was completed
#             sticky.completed = False
#             sticky.last_reset = now
#             sticky.save()

#     return jsonify({'message': 'Reset complete'}), 200