from app.middlewares.middleware_token import validate_token
from app.controllers.controller_sticky import stickies__, sticky_done, sticky_edit
from flask import Blueprint

stickies = Blueprint('stickies', __name__)

@stickies.route('/stickies', methods = ['GET', 'POST'])
@validate_token
def stickies_():
    return stickies__()
    

@stickies.route('/sticky-done/<sticky_id>', methods = ['PUT'])
@validate_token
def done_sticky(sticky_id):
    return sticky_done()


@stickies.route('/edit-sticky/<sticky_id>', methods = ['PUT'])
@validate_token
def edit_sticky(sticky_id):
    return sticky_edit()

# @stickies.route('/reset_stickies', methods = ['POST'])
# @validate_token
# def reset():
#     return reset_stickies()