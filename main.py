from app import create_app
from flask import render_template, request

app, db = create_app()

@app.route('/', methods=['GET'])
def home():
        message = request.args.get('message')
        # print(message)
        if message:
             return render_template('index.html', message=message)
        # return jsonify({'message': 'Hello there, your to-do list with Flask-python and MongoDB.'})
        return render_template('index.html')

# temporary ignoring the favicon internal error
@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/.well-known/appspecific/com.chrome.devtools.json')
def well_known():
    return '', 204


if __name__ == "__main__":
    port = 2705
    print(f'Server running on http://localhost:{port}')
    app.run(debug=True, port=port)