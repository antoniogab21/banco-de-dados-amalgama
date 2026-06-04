import random
import re
from datetime import datetime, timedelta
import requests

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

def validar_cnpj(cnpj):
    try:
        response = requests.get(
            f'https://www.receitaws.com.br/v1/cnpj/{cnpj}',
            timeout=10
        )

        if response.status_code != 200:
            return False, 'Não foi possível validar o CNPJ'

        data = response.json()

        if data.get('status') == 'ERROR':
            return False, data.get(
                'message',
                'CNPJ inválido'
            )

        return True, data

    except Exception as error:
        return False, str(error)

def gerar_codigo_email():
    return str(random.randint(100000, 999999))


def definir_codigo_verificacao(user):
    user.codigo_verificacao_email = gerar_codigo_email()
    user.codigo_verificacao_expira_em = datetime.utcnow() + timedelta(minutes=15)
    user.email_verificado = False


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
        'email_verificado': bool(user.email_verificado),
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

    cnpj_valido, resultado_cnpj = validar_cnpj(cnpj)

    if not cnpj_valido:
        return jsonify({
            'error': f'CNPJ inválido: {resultado_cnpj}'
        }), 400

    nome_receita = resultado_cnpj.get('nome')
    telefone_receita = resultado_cnpj.get('telefone')
    cidade_receita = resultado_cnpj.get('municipio')
    estado_receita = resultado_cnpj.get('uf')

    logradouro = resultado_cnpj.get('logradouro', '')
    numero = resultado_cnpj.get('numero', '')
    bairro = resultado_cnpj.get('bairro', '')

    endereco_receita = (
        f'{logradouro}, {numero} - {bairro}'
    ).strip()

    if Usuario.query.filter_by(email=email).first():
        return jsonify({
            'error': 'email já cadastrado'
        }), 400

    try:
        user = Usuario(
            email=email,
            tipo='mercado',
            tipo_definido=False,
            ativo=True,
        )

        user.set_password(senha)
        definir_codigo_verificacao(user)

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

        print(
            f'[VERIFICAÇÃO EMAIL] Código de {user.email}: '
            f'{user.codigo_verificacao_email}'
        )

        return jsonify({
            'message': 'cadastro criado, verifique seu email',
            'user': serialize_user(user),
            'pending_type_selection': True,
            'pending_email_verification': True,
            'verification_code_dev': user.codigo_verificacao_email,
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


@bp.route('/api/verify-email', methods=['POST'])
@login_required
def verify_email():
    data = request.get_json(silent=True) or request.form

    codigo = (data.get('codigo') or data.get('code') or '').strip()

    if not codigo:
        return jsonify({
            'error': 'código obrigatório'
        }), 400

    if current_user.email_verificado:
        return jsonify({
            'message': 'email já verificado',
            'user': serialize_user(current_user),
        })

    if not current_user.codigo_verificacao_email:
        return jsonify({
            'error': 'nenhum código ativo. solicite um novo código'
        }), 400

    if current_user.codigo_verificacao_expira_em:
        if datetime.utcnow() > current_user.codigo_verificacao_expira_em:
            return jsonify({
                'error': 'código expirado. solicite um novo código'
            }), 400

    if codigo != current_user.codigo_verificacao_email:
        return jsonify({
            'error': 'código inválido'
        }), 400

    current_user.email_verificado = True
    current_user.codigo_verificacao_email = None
    current_user.codigo_verificacao_expira_em = None

    db.session.commit()

    return jsonify({
        'message': 'email verificado com sucesso',
        'user': serialize_user(current_user),
    })


@bp.route('/api/resend-verification-code', methods=['POST'])
@login_required
def resend_verification_code():
    if current_user.email_verificado:
        return jsonify({
            'message': 'email já verificado',
            'user': serialize_user(current_user),
        })

    definir_codigo_verificacao(current_user)
    db.session.commit()

    print(
        f'[VERIFICAÇÃO EMAIL] Novo código de {current_user.email}: '
        f'{current_user.codigo_verificacao_email}'
    )

    return jsonify({
        'message': 'novo código enviado',
        'verification_code_dev': current_user.codigo_verificacao_email,
    })


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

    cnpj_valido, resultado_cnpj = validar_cnpj(cnpj)

    if not cnpj_valido:
        return jsonify({
            'error': f'CNPJ inválido: {resultado_cnpj}'
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

@bp.route('/api/cnpj/<cnpj>', methods=['GET'])
def consultar_cnpj(cnpj):
    cnpj = only_numbers(cnpj)

    if len(cnpj) != 14:
        return jsonify({
            'error': 'CNPJ inválido'
        }), 400

    valido, dados = validar_cnpj(cnpj)

    if not valido:
        return jsonify({
            'error': dados
        }), 400

    return jsonify({
        'nome': dados.get('nome'),
        'telefone': dados.get('telefone'),
        'cidade': dados.get('municipio'),
        'estado': dados.get('uf'),
        'logradouro': dados.get('logradouro'),
        'numero': dados.get('numero'),
        'bairro': dados.get('bairro'),
        'email': dados.get('email'),
    })


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
        'pending_email_verification': not bool(user.email_verificado),
    })


@bp.route('/api/me', methods=['GET'])
@login_required
def api_me():
    return jsonify({
        'user': serialize_user(current_user),
        'pending_type_selection': not bool(current_user.tipo_definido),
        'pending_email_verification': not bool(current_user.email_verificado),
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