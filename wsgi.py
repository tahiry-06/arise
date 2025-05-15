from app import create_app
from flask import render_template, request

app, db = create_app()

@app.route('/', methods=['GET'])
def home():
        message = request.args.get('message')
        if message:
             return render_template('index.html', message=message)
        return render_template('index.html')