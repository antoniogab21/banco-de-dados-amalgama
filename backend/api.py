from flask import Blueprint, jsonify, request, abort
from .models import (
    Produto, Pedido, MensagemGrupo, ItemPedido, ParticipacaoPedido,
    Empresa, Fornecedor, Grupo, EmpresaGrupo, Usuario, Seguidores,
    MovimentacaoEstoque, Pagamento, Notificacao, ConfiguracaoUsuario
)
from .extensions import db

bp = Blueprint('api', __name__, url_prefix='/api')


# -----------------------
# Produtos
# -----------------------

@bp.route('/produtos', methods=['GET'])
def list_produtos():
    produtos = Produto.query.filter_by(ativo=True).all()
    data = [
        {
            'id': p.id,
            'fornecedor_id': p.fornecedor_id,
            'nome': p.nome,
            'descricao': p.descricao,
            'preco': str(p.preco),
            'estoque': p.estoque,
            'imagem': p.imagem,
            'ativo': p.ativo
        }
        for p in produtos
    ]
    return jsonify(data)


@bp.route('/produtos/<int:id>', methods=['GET'])
def get_produto(id):
    p = Produto.query.get_or_404(id)
    return jsonify({
        'id': p.id,
        'fornecedor_id': p.fornecedor_id,
        'nome': p.nome,
        'descricao': p.descricao,
        'preco': str(p.preco),
        'estoque': p.estoque,
        'imagem': p.imagem,
        'ativo': p.ativo
    })


@bp.route('/produtos', methods=['POST'])
def criar_produto():
    data = request.json or {}
    fornecedor_id = data.get('fornecedor_id')
    nome = data.get('nome')
    preco = data.get('preco')
    if not fornecedor_id or not nome or preco is None:
        return jsonify({'error': 'fornecedor_id, nome e preco required'}), 400
    p = Produto(fornecedor_id=fornecedor_id, nome=nome, descricao=data.get('descricao'), preco=preco, estoque=data.get('estoque', 0), imagem=data.get('imagem'))
    db.session.add(p)
    db.session.commit()
    return jsonify({'id': p.id}), 201


@bp.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    p = Produto.query.get_or_404(id)
    data = request.json or {}
    for attr in ('nome','descricao','preco','estoque','imagem','ativo'):
        if attr in data:
            setattr(p, attr, data[attr])
    db.session.commit()
    return jsonify({'message':'updated'})


@bp.route('/produtos/<int:id>', methods=['DELETE'])
def remover_produto(id):
    p = Produto.query.get_or_404(id)
    p.ativo = False
    db.session.commit()
    return jsonify({'message':'soft deleted'})


# -----------------------
# Empresas / Fornecedores
# -----------------------

@bp.route('/empresas/<int:id>', methods=['GET'])
def empresa_get(id):
    e = Empresa.query.get_or_404(id)
    return jsonify({
        'id': e.id,
        'usuario_id': e.usuario_id,
        'nome': e.nome,
        'cnpj': e.cnpj,
        'foto_perfil': e.foto_perfil,
        'descricao': e.descricao,
        'endereco': e.endereco,
        'telefone': e.telefone,
        'cidade': e.cidade,
        'estado': e.estado
    })


@bp.route('/empresas/<int:id>', methods=['PUT'])
def empresa_update(id):
    e = Empresa.query.get_or_404(id)
    data = request.json or {}
    for attr in ('nome','foto_perfil','descricao','endereco','telefone','cidade','estado'):
        if attr in data:
            setattr(e, attr, data[attr])
    db.session.commit()
    return jsonify({'message':'updated'})


# -----------------------
# Seguidores
# -----------------------

@bp.route('/empresas/<int:id>/seguir', methods=['POST'])
def seguir_empresa(id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    if not empresa_id:
        return jsonify({'error':'empresa_id required'}),400
    if empresa_id == id:
        return jsonify({'error':'cannot follow self'}),400
    if Seguidores.query.filter_by(empresa_id=empresa_id, seguindo_empresa_id=id).first():
        return jsonify({'message':'already following'})
    s = Seguidores(empresa_id=empresa_id, seguindo_empresa_id=id)
    db.session.add(s)
    db.session.commit()
    return jsonify({'id':s.id}),201


@bp.route('/empresas/<int:id>/seguir', methods=['DELETE'])
def deixar_de_seguir(id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    if not empresa_id:
        return jsonify({'error':'empresa_id required'}),400
    s = Seguidores.query.filter_by(empresa_id=empresa_id, seguindo_empresa_id=id).first()
    if not s:
        return jsonify({'error':'not following'}),404
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message':'unfollowed'})


# -----------------------
# Grupos
# -----------------------

@bp.route('/grupos', methods=['GET'])
def list_grupos():
    grupos = Grupo.query.all()
    return jsonify([{'id':g.id,'nome':g.nome,'descricao':g.descricao,'foto_grupo':g.foto_grupo} for g in grupos])


@bp.route('/grupos/<int:grupo_id>/entrar', methods=['POST'])
def entrar_grupo(grupo_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    if not empresa_id:
        return jsonify({'error':'empresa_id required'}),400
    if EmpresaGrupo.query.filter_by(empresa_id=empresa_id, grupo_id=grupo_id).first():
        return jsonify({'message':'already member'})
    eg = EmpresaGrupo(empresa_id=empresa_id, grupo_id=grupo_id)
    db.session.add(eg)
    db.session.commit()
    return jsonify({'message':'joined'})


@bp.route('/grupos/<int:grupo_id>/sair', methods=['POST'])
def sair_grupo(grupo_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    if not empresa_id:
        return jsonify({'error':'empresa_id required'}),400
    eg = EmpresaGrupo.query.filter_by(empresa_id=empresa_id, grupo_id=grupo_id).first()
    if not eg:
        return jsonify({'error':'not a member'}),404
    db.session.delete(eg)
    db.session.commit()
    return jsonify({'message':'left'})


# -----------------------
# Chat de grupos
# -----------------------

@bp.route('/chat/<int:grupo_id>/mensagens', methods=['GET','POST'])
def chat_mensagens(grupo_id):
    if request.method == 'GET':
        msgs = MensagemGrupo.query.filter_by(grupo_id=grupo_id).order_by(MensagemGrupo.enviada_em.asc()).all()
        return jsonify([{'id':m.id,'mensagem':m.mensagem,'enviada_em':m.enviada_em.isoformat(),'empresa_id':m.empresa_id,'fornecedor_id':m.fornecedor_id} for m in msgs])
    else:
        data = request.json or {}
        mensagem = data.get('mensagem')
        empresa_id = data.get('empresa_id')
        fornecedor_id = data.get('fornecedor_id')
        if not mensagem:
            return jsonify({'error':'mensagem required'}),400
        m = MensagemGrupo(grupo_id=grupo_id, mensagem=mensagem, empresa_id=empresa_id, fornecedor_id=fornecedor_id)
        db.session.add(m)
        db.session.commit()
        return jsonify({'id':m.id}),201


# -----------------------
# Pedidos e participações
# -----------------------

@bp.route('/pedidos', methods=['POST'])
def criar_pedido():
    data = request.json or {}
    grupo_id = data.get('grupo_id')
    fornecedor_id = data.get('fornecedor_id')
    empresa_criadora_id = data.get('empresa_criadora_id')
    titulo = data.get('titulo')
    itens = data.get('itens', [])
    if not grupo_id or not fornecedor_id or not empresa_criadora_id:
        return jsonify({'error': 'missing fields'}), 400
    pedido = Pedido(grupo_id=grupo_id, fornecedor_id=fornecedor_id, empresa_criadora_id=empresa_criadora_id, titulo=titulo)
    db.session.add(pedido)
    db.session.flush()
    # criar itens
    for it in itens:
        produto_id = it.get('produto_id')
        quantidade = it.get('quantidade',1)
        produto = Produto.query.get(produto_id)
        if not produto:
            db.session.rollback()
            return jsonify({'error': f'produto {produto_id} not found'}),400
        ip = ItemPedido(pedido_id=pedido.id, produto_id=produto_id, quantidade=quantidade, preco_unitario=produto.preco)
        db.session.add(ip)
    db.session.commit()
    return jsonify({'id': pedido.id}), 201


@bp.route('/pedidos/<int:pedido_id>/participar', methods=['POST'])
def participar_pedido(pedido_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    quantidade = data.get('quantidade')
    if not empresa_id or quantidade is None:
        return jsonify({'error':'empresa_id and quantidade required'}),400
    pedido = Pedido.query.get_or_404(pedido_id)
    if pedido.status != 'ativo':
        return jsonify({'error':'pedido not active'}),400
    # cria ou atualiza participacao
    part = ParticipacaoPedido.query.filter_by(pedido_id=pedido_id, empresa_id=empresa_id).first()
    if part:
        part.quantidade = quantidade
    else:
        part = ParticipacaoPedido(pedido_id=pedido_id, empresa_id=empresa_id, quantidade=quantidade)
        db.session.add(part)
    db.session.commit()
    return jsonify({'id': part.id}),201


@bp.route('/pedidos/<int:pedido_id>/cancelar', methods=['POST'])
def cancelar_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)
    pedido.status = 'cancelado'
    db.session.commit()
    return jsonify({'message':'cancelled'})


@bp.route('/pedidos/<int:pedido_id>/finalizar', methods=['POST'])
def finalizar_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)
    pedido.status = 'finalizado'
    db.session.commit()
    return jsonify({'message':'finalized'})


@bp.route('/pedidos', methods=['GET'])
def listar_pedidos():
    status = request.args.get('status')
    q = Pedido.query
    if status:
        q = q.filter_by(status=status)
    pedidos = q.all()
    out = []
    for p in pedidos:
        out.append({
            'id': p.id,
            'grupo_id': p.grupo_id,
            'fornecedor_id': p.fornecedor_id,
            'empresa_criadora_id': p.empresa_criadora_id,
            'titulo': p.titulo,
            'status': p.status,
            'itens': [{'produto_id':it.produto_id,'quantidade':it.quantidade,'preco_unitario':str(it.preco_unitario)} for it in p.itens],
            'participantes': [{'empresa_id':pp.empresa_id,'quantidade':pp.quantidade} for pp in p.participacoes]
        })
    return jsonify(out)


# -----------------------
# Pagamentos
# -----------------------

@bp.route('/pedidos/<int:pedido_id>/pagamentos', methods=['POST'])
def criar_pagamento(pedido_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    valor = data.get('valor')
    if not empresa_id or valor is None:
        return jsonify({'error':'empresa_id and valor required'}),400
    pagamento = Pagamento(pedido_id=pedido_id, empresa_id=empresa_id, valor=valor)
    db.session.add(pagamento)
    db.session.commit()
    return jsonify({'id':pagamento.id}),201


# -----------------------
# Notificações e configurações
# -----------------------

@bp.route('/notificacoes', methods=['GET'])
def listar_notificacoes():
    usuario_id = request.args.get('usuario_id')
    if not usuario_id:
        return jsonify({'error':'usuario_id required'}),400
    nots = Notificacao.query.filter_by(usuario_id=usuario_id).order_by(Notificacao.criada_em.desc()).all()
    return jsonify([{'id':n.id,'titulo':n.titulo,'mensagem':n.mensagem,'lida':n.lida,'criada_em':n.criada_em.isoformat()} for n in nots])


@bp.route('/configuracao/<int:usuario_id>', methods=['GET','PUT'])
def configuracao_usuario(usuario_id):
    config = ConfiguracaoUsuario.query.filter_by(usuario_id=usuario_id).first()
    if request.method == 'GET':
        if not config:
            return jsonify({'usuario_id': usuario_id, 'receber_notificacoes': True, 'tema': 'light'})
        return jsonify({'usuario_id':config.usuario_id,'receber_notificacoes':config.receber_notificacoes,'tema':config.tema})
    else:
        data = request.json or {}
        if not config:
            config = ConfiguracaoUsuario(usuario_id=usuario_id)
            db.session.add(config)
        if 'receber_notificacoes' in data:
            config.receber_notificacoes = data['receber_notificacoes']
        if 'tema' in data:
            config.tema = data['tema']
        db.session.commit()
        return jsonify({'message':'updated'})
