from .error_constant import ERROR_MESSAGES
from flask import jsonify


class Error(Exception):
    def __init__(self, code, details = None):
        self.code = code
        self.message = ERROR_MESSAGES.get(code, 'Unknown Error!')
        self.details = details
        super().__init__(self.message)
def error_handler(app):
    @app.errorhandler(Exception)
    def handle_exception(error):
        return jsonify({
            "error_code": error.code,
            "error_message": error.message,
            "details": error.details  
        }), error.code


    