import re
from flask import Blueprint, request, jsonify
from flask_login import (
    login_user,
    logout_user,
    login_required,
    current_user,
)

from .extensions import db, login_manager
from .models import (
    Usuario,
    Empresa,
    Fornecedor,
    ConfiguracaoUsuario,
)


bp = Blueprint('auth', __name__)


@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))


def only_numbers(value):
    return re.sub(r'\D', '', value or '')


def serialize_user(user):
    perfil = None

    if user.tipo == 'mercado' and user.empresa:
        perfil = {
            'id': user.empresa.id,
            'nome': user.empresa.nome,
            'cnpj': user.empresa.cnpj,
            'foto_perfil': user.empresa.foto_perfil,
            'descricao': user.empresa.descricao,
            'endereco': user.empresa.endereco,
            'telefone': user.empresa.telefone,
            'cidade': user.empresa.cidade,
            'estado': user.empresa.estado,
        }

    if user.tipo == 'fornecedor' and user.fornecedor:
        perfil = {
            'id': user.fornecedor.id,
            'nome': user.fornecedor.nome,
            'cnpj': user.fornecedor.cnpj,
            'foto_perfil': user.fornecedor.foto_perfil,
            'descricao': user.fornecedor.descricao,
            'endereco': user.fornecedor.endereco,
            'telefone': user.fornecedor.telefone,
            'cidade': user.fornecedor.cidade,
            'estado': user.fornecedor.estado,
        }

    return {
        'id': user.id,
        'email': user.email,
        'tipo': user.tipo,
        'tipo_definido': bool(user.tipo_definido),
        'ativo': user.ativo,
        'perfil': perfil,
    }


@bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or request.form

    email = (data.get('email') or '').strip().lower()
    senha = data.get('senha') or data.get('password')

    nome = (
        data.get('nome') or
        data.get('companyName') or
        data.get('name') or
        ''
    ).strip()

    cnpj = only_numbers(data.get('cnpj'))

    telefone = data.get('telefone') or data.get('phone')
    endereco = data.get('endereco') or data.get('address')
    cidade = data.get('cidade') or data.get('city')
    estado = data.get('estado') or data.get('state')

    if not email:
        return jsonify({'error': 'email obrigatório'}), 400

    if not senha:
        return jsonify({'error': 'senha obrigatória'}), 400

    if len(senha) < 3:
        return jsonify({
            'error': 'senha deve ter pelo menos 3 caracteres'
        }), 400

    if not nome:
        return jsonify({
            'error': 'nome da empresa obrigatório'
        }), 400

    if len(cnpj) != 14:
        return jsonify({
            'error': 'CNPJ deve conter exatamente 14 números'
        }), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'error': 'email já cadastrado'}), 400

    if Empresa.query.filter_by(cnpj=cnpj).first() or Fornecedor.query.filter_by(cnpj=cnpj).first():
        return jsonify({'error': 'CNPJ já cadastrado'}), 400

    try:
        user = Usuario(
            email=email,
            tipo='mercado',
            tipo_definido=False,
            ativo=True,
        )
        user.set_password(senha)

        db.session.add(user)
        db.session.flush()

        config = ConfiguracaoUsuario(
            usuario_id=user.id,
            receber_notificacoes=True,
            tema='light',
        )
        db.session.add(config)

        db.session.commit()

        login_user(user)

        return jsonify({
            'message': 'cadastro criado, escolha o tipo da conta',
            'user': serialize_user(user),
            'pending_type_selection': True,
            'cadastro_temp': {
                'nome': nome,
                'cnpj': cnpj,
                'telefone': telefone,
                'endereco': endereco,
                'cidade': cidade,
                'estado': estado,
            }
        }), 201

    except Exception as error:
        db.session.rollback()

        return jsonify({
            'error': 'erro ao criar conta',
            'details': str(error),
        }), 500


@bp.route('/api/select-type', methods=['POST'])
@login_required
def select_type():
    data = request.get_json(silent=True) or request.form

    tipo = data.get('tipo')
    nome = (
        data.get('nome') or
        data.get('companyName') or
        data.get('name') or
        ''
    ).strip()

    cnpj = only_numbers(data.get('cnpj'))

    telefone = data.get('telefone') or data.get('phone')
    endereco = data.get('endereco') or data.get('address')
    cidade = data.get('cidade') or data.get('city')
    estado = data.get('estado') or data.get('state')

    if tipo == 'empresa':
        tipo = 'mercado'

    if tipo not in ['mercado', 'fornecedor']:
        return jsonify({
            'error': 'tipo deve ser mercado ou fornecedor'
        }), 400

    if not nome:
        return jsonify({
            'error': 'nome da empresa obrigatório'
        }), 400

    if len(cnpj) != 14:
        return jsonify({
            'error': 'CNPJ deve conter exatamente 14 números'
        }), 400

    if current_user.tipo_definido:
        return jsonify({
            'error': 'tipo da conta já foi definido'
        }), 400

    if Empresa.query.filter_by(cnpj=cnpj).first() or Fornecedor.query.filter_by(cnpj=cnpj).first():
        return jsonify({
            'error': 'CNPJ já cadastrado'
        }), 400

    try:
        current_user.tipo = tipo
        current_user.tipo_definido = True

        if tipo == 'mercado':
            perfil = Empresa(
                usuario_id=current_user.id,
                nome=nome,
                cnpj=cnpj,
                telefone=telefone,
                endereco=endereco,
                cidade=cidade,
                estado=estado,
            )
        else:
            perfil = Fornecedor(
                usuario_id=current_user.id,
                nome=nome,
                cnpj=cnpj,
                telefone=telefone,
                endereco=endereco,
                cidade=cidade,
                estado=estado,
            )

        db.session.add(perfil)
        db.session.commit()

        return jsonify({
            'message': 'tipo da conta definido com sucesso',
            'user': serialize_user(current_user),
        })

    except Exception as error:
        db.session.rollback()

        return jsonify({
            'error': 'erro ao definir tipo da conta',
            'details': str(error),
        }), 500


@bp.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True) or request.form

    email = (data.get('email') or '').strip().lower()
    senha = data.get('senha') or data.get('password')

    if not email or not senha:
        return jsonify({
            'error': 'email e senha são obrigatórios'
        }), 400

    user = Usuario.query.filter_by(email=email).first()

    if not user or not user.check_password(senha):
        return jsonify({
            'error': 'email ou senha inválidos'
        }), 401

    if not user.ativo:
        return jsonify({
            'error': 'usuário desativado'
        }), 403

    login_user(user)

    return jsonify({
        'message': 'login realizado com sucesso',
        'user': serialize_user(user),
        'pending_type_selection': not bool(user.tipo_definido),
    })


@bp.route('/api/me', methods=['GET'])
@login_required
def api_me():
    return jsonify({
        'user': serialize_user(current_user),
        'pending_type_selection': not bool(current_user.tipo_definido),
    })


@bp.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()

    return jsonify({
        'message': 'logout realizado com sucesso'
    })


@bp.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json(silent=True) or request.form

    senha_atual = (
        data.get('current') or
        data.get('senha_atual') or
        data.get('currentPassword')
    )

    nova_senha = (
        data.get('new') or
        data.get('nova_senha') or
        data.get('newPassword')
    )

    if not senha_atual or not nova_senha:
        return jsonify({
            'error': 'senha atual e nova senha são obrigatórias'
        }), 400

    if not current_user.check_password(senha_atual):
        return jsonify({
            'error': 'senha atual incorreta'
        }), 401

    if len(nova_senha) < 3:
        return jsonify({
            'error': 'nova senha deve ter pelo menos 3 caracteres'
        }), 400

    current_user.set_password(nova_senha)
    db.session.commit()

    return jsonify({
        'message': 'senha atualizada com sucesso'
    })


@bp.route('/api/recover', methods=['POST'])
def recover_password():
    data = request.get_json(silent=True) or request.form

    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({
            'error': 'email obrigatório'
        }), 400

    return jsonify({
        'message': 'se o email existir, as instruções de recuperação serão enviadas'
    })