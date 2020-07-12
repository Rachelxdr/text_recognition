from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)

from my_app.db import get_db
from my_app.auth import login_required
from my_app.aws_script.s3 import new_bucket
from my_app.aws_script.detect_text import detect_text
bp = Blueprint('main_page', __name__)

@bp.route('/index', methods=('GET', 'POST'))
def upload():
    if request.method == 'POST':
        information = dict()
        information['bucketName'] = request.form['bucketName']
        information['albumName'] = request.form['albumName']
        error = None
        db = get_db()
        
        if not information['pictureName']:
            error = 'Picture name is required'
        elif not information['bucket']:
            error = 'Bucket name is required'
            
        if error is not None:
            flask(error)
        else :
            db.execute(
                'INSERT INTO pictures (picture_name, bucket, owner_id) VALUES (?, ?, ?)', 
                (information['pictureName'], information['bucket'], g.user['id'],)
            )
            db.commit()
            # s3_upload(information['pictureName'], information['bucket'])
            return render_template('main_page/index.html')
            # return redirect(url_for('main_page.upload_success', information=information))
    
    return render_template('main_page/index.html')

# @bp.route('/upload_success')
# def upload_success():
#     return render_template('main_page/upload_success.html')

@bp.route('/add_bucket', methods=('GET', 'POST'))
def add_bucket():
    if request.method == 'POST':
        information = dict()
        information['bucketName'] = request.form['bucketName']
        information['region'] = request.form['region']
        error = None
        db = get_db()

        if not information['bucketName']:
            error = 'Bucket name is required'
        elif not information['region']:
            error = 'Please Enter an AWS Region'
        
        if error is not None:
            flash(error)
        else:
            db.execute(
                'UPDATE users SET bucket_name = ?, region = ?  WHERE id = ?', (information['bucketName'], information['region'],g.user['id'],)
            )
            db.commit()
            
        create_result = new_bucket(information['bucketName'], information['region'])
        if create_result == "success":
            flash("Bucket Created!")
            return redirect(url_for('main_page.add_album', bucketName=information['bucketName'], region=information['region']))
            # return render_template('main_page/add_album.html', information=information)
        else:
            flash("There was an error creating your bucket: ", create_result)
            return render_template('main_page/add_bucket.html')

    return render_template('main_page/add_bucket.html')

@bp.route('/add_album', methods=('GET', 'POST'))
def add_album():
    bucketName=request.args['bucketName']
    region=request.args['region']
    if request.method == 'POST':
        album = request.form['album']
        photoName = request.form['photoName']
        error = None

        if not photoName:
            error = 'Please choose a photo.'
        
        if error is not None:
            flash(error)
        else:
            path = album + "//" + photoName
            detect_text(path, bucketName)

    return render_template('main_page/add_album.html', bucketName=bucketName, region=region)