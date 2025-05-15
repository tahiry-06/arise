from app.services.error_handler import Error
from app.models.model_users import User
from app.models.model_todos import Todo
from flask import jsonify, request, make_response

import datetime

def todo():
    if request.method == 'GET':
        user = request.user
        todos = Todo.objects(user=user['id'])
        todo_list = []
        for item in todos:
            todo_list.append(item.to_dict()) 

        about = todo_counts(user['id'])
        # return jsonify({'message': f'You have {len(todo_list)} todos', 'todo': todo_list, 'todo_count': len(todo_list)}) , 200
        # return jsonify({'message': 'Challenge created successfully.'}) , 200
        # usr = User.objects(id=user['id']).first()

        return make_response(jsonify({
            'todo': todo_list,
            # 'user': usr.to_dict(),
            'about': about
        }))
    
    elif request.method == 'POST':
        data = request.get_json()
        user = request.user
        

        if not data['name'] or not data['description'] or not data['due_date']:
            # print(data)
            raise Error(400, details = 'All fields are mandatory!')
        new_todo = Todo(
            user = user['id'],
            title = data['name'],
            content = data['description'],
            urgency = data['urge'],
            category = data['category'],
            due_date = datetime.datetime.fromisoformat(data['due_date'])
        )
        new_todo.save()

        todos = Todo.objects(user=user['id'])
        todo_list = []
        for item in todos:
            todo_list.append(item.to_dict()) 


        about = todo_counts(user['id'])
        return make_response(jsonify({
                'message': 'Todo created successfully.', 
                'todo': new_todo.to_dict(),
                'about': about
            })
        )

def edit_todo():
    if request.method == 'GET':
        user = request.user
        todo_id = request.view_args.get('todo_id')
        todo = Todo.objects(id=todo_id).first()
        if not todo:
            raise Error(400, details = 'To-do not found.')
        return jsonify({'message': f'Your file to edit id here.', 'todo': todo.to_dict()}), 200
    elif request.method == 'PUT':
        user = request.user
        todo_id = request.view_args.get('todo_id')
        todo = Todo.objects(id=todo_id).first()
        data = request.get_json()
        if not todo:
            raise Error(400, details = 'To-do not found.')
        todo.update(**data)
        todo.reload()

        about = todo_counts(user['id'])
        return make_response(jsonify({
            'message': 'A todo have been successfully updated.', 
            'todo': todo.to_dict(),
            'about': about
        }))
    
def done_todo():
    user = request.user
    todo_id = request.view_args.get('todo_id')
    todo = Todo.objects(id=todo_id).first()
    if not todo:
        raise Error(400, details = 'To-do not found.')
    
    # data = request.get_json()
    
    todo.completed = not todo.completed
    todo.save()
    about = todo_counts(user['id'])
    return make_response(jsonify({
            'message': 'A todo have been successfully done.', 
            'todo': todo.to_dict(),
            'about': about
        }))
    # else:
    #     return jsonify({'error': 'Task not found'}), 404
    
def delete_todo():

    if request.method == 'DELETE':
        todo_id = request.view_args.get('todo_id')
        todo = Todo.objects(id=todo_id).first()
        if not todo:
            raise Error(400, details = 'To-do not found.')
        todo.delete()

        user = request.user
        about = todo_counts(user['id'])
        return make_response(jsonify({
            'message': 'A todo have been successfully deleted.',
            'about': about
        }), 200)
    
def todo_counts(user_id):
    today = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    count = Todo.objects(user=user_id).count()
    overdue_count = Todo.objects(user= user_id, due_date__lt= today, completed= False).count()
    in_progress_count = Todo.objects(user= user_id, due_date__gte= today, completed= False).count()
    important = Todo.objects(user = user_id, urgency = True, completed= False, due_date__gte= today,).count()
    completed_count = Todo.objects(user= user_id, completed= True).count()

    return {
        'count': count, 
        "overdue": overdue_count, 
        "important": important, 
        "completed": completed_count, 
        'in_progress': in_progress_count
    }
