import os
import pickle
import json
from flask import Flask, render_template,jsonify

app=Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/forumGraph')
def forumGraph():
    with open('assets' + os.sep + 'to_plotPosts.json','r',encoding='utf8') as f:
        js = json.load(f)
    
    return jsonify(js)


if __name__ == "__main__":
    app.run(debug=True)