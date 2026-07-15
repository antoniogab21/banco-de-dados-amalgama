import secrets
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_login import (
    current_user,
    login_required,
    login_user,
    logout_user,
)

from .extensions import db, login_manager
from .models import Empresa, Fornecedor, Usuario

bp = Blueprint("auth", __name__)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Usuario, int(user_id))


def gerar_codigo_verificacao():
    return f"{secrets.randbelow(1_000_000):06d}"


def criar_codigo_verificacao(user):
    codigo = gerar_codigo_verificacao()

    user.codigo_verificacao = codigo
    user.codigo_verificacao_expira_em = (
        datetime.utcnow() + timedelta(minutes=15)
    )

    return codigo


def serialize_user(user):
    perfil = user.empresa if user.tipo == "mercado" else user.fornecedor

    return {
        "id": user.id,
        "email": user.email,
        "tipo": user.tipo,
        "ativo": user.ativo,
        "email_verificado": user.email_verificado,
        "tipo_definido": perfil is not None,
        "perfil": (
            {
                "id": perfil.id,
                "nome": perfil.nome,
                "cnpj": perfil.cnpj,
            }
            if perfil
            else None
        ),
    }


@bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or request.form

    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha") or data.get("password")

    if not email or not senha:
        return jsonify({"error": "email e senha são obrigatórios"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "este e-mail já está cadastrado"}), 409

    user = Usuario(
        email=email,
        tipo="mercado",
        email_verificado=False,
    )
    user.set_password(senha)

    codigo = criar_codigo_verificacao(user)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Código de verificação gerado.",
        "pending_email_verification": True,
        "verification_code_dev": codigo,
    }), 201


@bp.route("/api/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json(silent=True) or request.form

    email = (data.get("email") or "").strip().lower()
    codigo = (data.get("codigo") or "").strip()

    if not email or not codigo:
        return jsonify({"error": "email e código são obrigatórios"}), 400

    user = Usuario.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "usuário não encontrado"}), 404

    if user.email_verificado:
        return jsonify({"message": "e-mail já verificado"})

    if (
        user.codigo_verificacao != codigo
        or not user.codigo_verificacao_expira_em
        or user.codigo_verificacao_expira_em < datetime.utcnow()
    ):
        return jsonify({"error": "código inválido ou expirado"}), 400

    user.email_verificado = True
    user.codigo_verificacao = None
    user.codigo_verificacao_expira_em = None

    db.session.commit()

    return jsonify({
        "message": "E-mail verificado com sucesso.",
    })


@bp.route("/api/resend-verification-code", methods=["POST"])
def resend_verification_code():
    data = request.get_json(silent=True) or request.form
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "email é obrigatório"}), 400

    user = Usuario.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "usuário não encontrado"}), 404

    if user.email_verificado:
        return jsonify({"message": "e-mail já verificado"})

    codigo = criar_codigo_verificacao(user)
    db.session.commit()

    return jsonify({
        "message": "Novo código gerado.",
        "verification_code_dev": codigo,
    })


@bp.route("/api/select-type", methods=["POST"])
def select_type():
    data = request.get_json(silent=True) or request.form

    email = (data.get("email") or "").strip().lower()
    tipo = data.get("tipo")
    nome = (data.get("companyName") or "").strip()
    cnpj = "".join(filter(str.isdigit, data.get("cnpj") or ""))

    if tipo not in ("mercado", "fornecedor"):
        return jsonify({"error": "tipo inválido"}), 400

    if not email or not nome or len(cnpj) != 14:
        return jsonify({
            "error": "e-mail, nome da empresa e CNPJ válido são obrigatórios"
        }), 400

    user = Usuario.query.filter_by(email=email).first()

    if not user or not user.email_verificado:
        return jsonify({"error": "verifique o e-mail antes de escolher o tipo"}), 403

    if user.empresa or user.fornecedor:
        return jsonify({"error": "o tipo desta conta já foi definido"}), 409

    cnpj_em_uso = (
        Empresa.query.filter_by(cnpj=cnpj).first()
        or Fornecedor.query.filter_by(cnpj=cnpj).first()
    )

    if cnpj_em_uso:
        return jsonify({"error": "este CNPJ já está cadastrado"}), 409

    dados_perfil = {
        "usuario_id": user.id,
        "nome": nome,
        "cnpj": cnpj,
        "telefone": data.get("telefone") or None,
        "endereco": data.get("endereco") or None,
        "cidade": data.get("cidade") or None,
        "estado": data.get("estado") or None,
    }

    user.tipo = tipo

    if tipo == "mercado":
        db.session.add(Empresa(**dados_perfil))
    else:
        db.session.add(Fornecedor(**dados_perfil))

    db.session.commit()

    return jsonify({
        "message": "Conta criada com sucesso. Faça login para continuar.",
    }), 201


@bp.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or request.form

    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha") or data.get("password")

    user = Usuario.query.filter_by(email=email).first()

    if not user or not senha or not user.check_password(senha):
        return jsonify({"error": "e-mail ou senha inválidos"}), 401

    if not user.email_verificado:
        return jsonify({"error": "verifique seu e-mail antes de entrar"}), 403

    if not user.ativo:
        return jsonify({"error": "conta desativada"}), 403

    login_user(user)

    return jsonify({
        "message": "Login realizado com sucesso",
        "user": serialize_user(user),
    })


@bp.route("/api/me", methods=["GET"])
@login_required
def api_me():
    return jsonify(serialize_user(current_user))


@bp.route("/api/logout", methods=["POST"])
@login_required
def api_logout():
    logout_user()
    return jsonify({"message": "Logout realizado"})