from app.controllers.controller_todo import todo, edit_todo, done_todo, delete_todo
from app.middlewares.middleware_token import validate_token
from flask import Blueprint

todos = Blueprint('todos', __name__)

@todos.route('/todos/', methods=['GET', 'POST'])
@validate_token
def todo_list():
    return todo()

@todos.route('/edit-todo/<todo_id>', methods=['GET', 'PUT'])
@validate_token
def todo_edit(todo_id):
    return edit_todo()

@todos.route('/done-todo/<todo_id>', methods=[ 'PUT'])
@validate_token
def todo_done(todo_id):
    return done_todo()

@todos.route('/delete-todo/<todo_id>', methods=['DELETE'])
@validate_token
def todo_delete(todo_id):
    return delete_todo()