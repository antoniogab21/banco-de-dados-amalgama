from flask import Blueprint, jsonify, request
from .models import Produto, Pedido, MensagemGrupo
from .extensions import db

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/produtos', methods=['GET'])
def list_produtos():
    produtos = Produto.query.filter_by(ativo=True).all()
    data = [
        {
            'id': p.id,
            'nome': p.nome,
            'descricao': p.descricao,
            'preco': str(p.preco),
            'estoque': p.estoque,
            'imagem': p.imagem
        }
        for p in produtos
    ]
    return jsonify(data)


@bp.route('/produtos/<int:id>', methods=['GET'])
def get_produto(id):
    p = Produto.query.get_or_404(id)
    return jsonify({
        'id': p.id,
        'nome': p.nome,
        'descricao': p.descricao,
        'preco': str(p.preco),
        'estoque': p.estoque,
        'imagem': p.imagem
    })


@bp.route('/pedidos', methods=['POST'])
def criar_pedido():
    data = request.json
    # Minimal validation: expect grupo_id, fornecedor_id, empresa_criadora_id
    grupo_id = data.get('grupo_id')
    fornecedor_id = data.get('fornecedor_id')
    empresa_criadora_id = data.get('empresa_criadora_id')
    titulo = data.get('titulo')
    if not grupo_id or not fornecedor_id or not empresa_criadora_id:
        return jsonify({'error': 'missing fields'}), 400
    pedido = Pedido(grupo_id=grupo_id, fornecedor_id=fornecedor_id, empresa_criadora_id=empresa_criadora_id, titulo=titulo)
    db.session.add(pedido)
    db.session.commit()
    return jsonify({'id': pedido.id}), 201


@bp.route('/chat/<int:grupo_id>/mensagens', methods=['GET','POST'])
def chat_mensagens(grupo_id):
    if request.method == 'GET':
        msgs = MensagemGrupo.query.filter_by(grupo_id=grupo_id).order_by(MensagemGrupo.enviada_em.asc()).all()
        return jsonify([{'id':m.id,'mensagem':m.mensagem,'enviada_em':m.enviada_em.isoformat()} for m in msgs])
    else:
        data = request.json
        mensagem = data.get('mensagem')
        empresa_id = data.get('empresa_id')
        fornecedor_id = data.get('fornecedor_id')
        if not mensagem:
            return jsonify({'error':'mensagem required'}),400
        m = MensagemGrupo(grupo_id=grupo_id, mensagem=mensagem, empresa_id=empresa_id, fornecedor_id=fornecedor_id)
        db.session.add(m)
        db.session.commit()
        return jsonify({'id':m.id}),201
