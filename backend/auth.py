from flask import Blueprint, request, jsonify, redirect, url_for, render_template, flash
from .extensions import db, login_manager
from .models import Usuario
from flask_login import login_user, logout_user, login_required, current_user

bp = Blueprint('auth', __name__)


@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))


@bp.route('/api/register', methods=['POST'])
def register():
    data = request.json or request.form
    email = data.get('email')
    senha = data.get('senha')
    tipo = data.get('tipo', 'mercado')
    if not email or not senha:
        return jsonify({'error': 'email and senha required'}), 400
    if Usuario.query.filter_by(email=email).first():
        return jsonify({'error': 'email exists'}), 400
    user = Usuario(email=email, tipo=tipo)
    user.set_password(senha)
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'email': user.email}), 201


@bp.route('/api/login', methods=['POST'])
def api_login():
    data = request.json or request.form
    email = data.get('email')
    senha = data.get('senha')
    if not email or not senha:
        return jsonify({'error': 'email and senha required'}), 400
    user = Usuario.query.filter_by(email=email).first()
    if not user or not user.check_password(senha):
        return jsonify({'error': 'invalid credentials'}), 401
    login_user(user)
    return jsonify({'message': 'logged in', 'user_id': user.id})


@bp.route('/api/me', methods=['GET'])
@login_required
def api_me():
    user = current_user
    return jsonify({'id': user.id, 'email': user.email, 'tipo': user.tipo, 'ativo': user.ativo})


@bp.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'message': 'logged out'})


@bp.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.json or request.form
    current = data.get('current')
    new = data.get('new')
    if not current or not new:
        return jsonify({'error':'current and new required'}),400
    if not current_user.check_password(current):
        return jsonify({'error':'current password incorrect'}),401
    current_user.set_password(new)
    db.session.commit()
    return jsonify({'message':'password updated'})


@bp.route('/api/recover', methods=['POST'])
def recover_password():
    # placeholder for future implementation (send email/token)
    data = request.json or request.form
    email = data.get('email')
    if not email:
        return jsonify({'error':'email required'}),400
    user = Usuario.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message':'if the email exists, recovery instructions will be sent'})
    return jsonify({'message':'recovery not implemented yet'})
