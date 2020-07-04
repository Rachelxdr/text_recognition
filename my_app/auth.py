import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from werkzeug.security import check_password_hash, generate_password_hash

from my_app.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=('GET','POST'))
def register():
    if request.method == 'POST': 
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif db.execute(  # db.executetake a SQL query with ? placeholders for any user input and a tuple of values to replace the placeholders with
            'SELECT id FROM users WHERE username = ?',  (username,)
        ).fetchone() is not None: # returns one row from the query
            return redirect((url_for('auth.login')))

        if error is None:
            db.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)', 
                (username, generate_password_hash(password),)
                # (username, password,)
            )

            db.commit() # saves all changes
            return redirect((url_for('auth.login'))) # url_for generates tje URL for the login view based on its name

        flash(error)
    
    return render_template('auth/register.html')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.execute(
            'SELECT password FROM users WHERE username = ?', (username,)
        ).fetchone()
        if user is None:
            error = 'Invalid username'
        elif not check_password_hash(user['password'], password):
        # elif user['password'] != password:
            error = 'Incorrect password'
        
        if error is None:
            session.clear()
            cur_id = db.execute(
            'SELECT id FROM users WHERE username = ?', (username,)
        ).fetchone()
            session['user_id'] = cur_id[0] # the user's id is stored in a new session. The data is stored in a cookie that is sent to the browser
            return redirect(url_for('main_page.upload'))
        
        flash(error)
    
    return render_template('auth/login.html')

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT id FROM users WHERE id = ?', (user_id,)
        ).fetchone()


@bp.route('/logout')
def logout():
    print("logout")
    session.clear()
    return redirect(url_for('auth.login'))

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None: 
            return redirect(url_for('auth.login')) 
        
        return view(**kwargs) 
    
    return wrapped_view