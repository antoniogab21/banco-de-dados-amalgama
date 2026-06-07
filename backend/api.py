from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request, abort
from flask_login import login_required, current_user
from backend.extensions import socketio
from flask_socketio import join_room, leave_room

from .models import (
    Produto,
    Pedido,
    MensagemGrupo,
    ItemPedido,
    ParticipacaoPedido,
    Empresa,
    Fornecedor,
    Grupo,
    EmpresaGrupo,
    Usuario,
    Seguidores,
    MovimentacaoEstoque,
    Pagamento,
    Notificacao,
    ConfiguracaoUsuario,
)

from .extensions import db


bp = Blueprint('api', __name__, url_prefix='/api')


# -----------------------
# Produtos
# -----------------------

def serialize_produto(p):
    return {
        'id': p.id,
        'fornecedor_id': p.fornecedor_id,
        'fornecedor_nome': p.fornecedor.nome if p.fornecedor else None,
        'nome': p.nome,
        'descricao': p.descricao,
        'preco': float(p.preco),
        'estoque': p.estoque,
        'imagem': p.imagem,
        'ativo': p.ativo,
        'criado_em': p.criado_em.isoformat() if p.criado_em else None,
        'atualizado_em': p.atualizado_em.isoformat() if p.atualizado_em else None,
    }


@bp.route('/produtos', methods=['GET'])
@login_required
def list_produtos():
    if current_user.tipo == 'fornecedor':
        if not current_user.fornecedor:
            return jsonify({'error': 'fornecedor não encontrado'}), 404

        produtos = Produto.query.filter_by(
            fornecedor_id=current_user.fornecedor.id
        ).all()
    else:
        produtos = Produto.query.filter_by(
            ativo=True
        ).all()

    return jsonify([
        serialize_produto(p)
        for p in produtos
    ])


@bp.route('/produtos/<int:id>', methods=['GET'])
@login_required
def get_produto(id):
    p = Produto.query.get_or_404(id)

    if current_user.tipo == 'fornecedor':
        if not current_user.fornecedor or p.fornecedor_id != current_user.fornecedor.id:
            return jsonify({'error': 'acesso negado'}), 403

    if current_user.tipo == 'mercado' and not p.ativo:
        return jsonify({'error': 'produto não encontrado'}), 404

    return jsonify(serialize_produto(p))


@bp.route('/produtos', methods=['POST'])
@login_required
def criar_produto():
    if current_user.tipo != 'fornecedor':
        return jsonify({
            'error': 'apenas fornecedores podem cadastrar produtos'
        }), 403

    if not current_user.fornecedor:
        return jsonify({
            'error': 'perfil de fornecedor não encontrado'
        }), 404

    data = request.get_json(silent=True) or {}

    nome = (data.get('nome') or data.get('name') or '').strip()
    descricao = data.get('descricao') or data.get('description')
    preco = data.get('preco') or data.get('price')
    estoque = data.get('estoque') or data.get('stock') or 0
    imagem = data.get('imagem') or data.get('image')

    if not nome:
        return jsonify({'error': 'nome obrigatório'}), 400

    if preco is None or preco == '':
        return jsonify({'error': 'preço obrigatório'}), 400

    try:
        preco = float(preco)
        estoque = int(estoque)
    except ValueError:
        return jsonify({
            'error': 'preço e estoque devem ser números válidos'
        }), 400

    if preco < 0:
        return jsonify({'error': 'preço não pode ser negativo'}), 400

    if estoque < 0:
        return jsonify({'error': 'estoque não pode ser negativo'}), 400

    produto = Produto(
        fornecedor_id=current_user.fornecedor.id,
        nome=nome,
        descricao=descricao,
        preco=preco,
        estoque=estoque,
        imagem=imagem,
        ativo=True,
    )

    db.session.add(produto)
    db.session.commit()

    return jsonify({
        'message': 'produto criado com sucesso',
        'produto': serialize_produto(produto),
    }), 201


@bp.route('/produtos/<int:id>', methods=['PUT'])
@login_required
def atualizar_produto(id):
    if current_user.tipo != 'fornecedor':
        return jsonify({
            'error': 'apenas fornecedores podem editar produtos'
        }), 403

    if not current_user.fornecedor:
        return jsonify({
            'error': 'perfil de fornecedor não encontrado'
        }), 404

    produto = Produto.query.get_or_404(id)

    if produto.fornecedor_id != current_user.fornecedor.id:
        return jsonify({'error': 'acesso negado'}), 403

    data = request.get_json(silent=True) or {}

    if 'nome' in data or 'name' in data:
        produto.nome = (
            data.get('nome') or data.get('name') or ''
        ).strip()

    if 'descricao' in data or 'description' in data:
        produto.descricao = data.get('descricao') or data.get('description')

    if 'preco' in data or 'price' in data:
        try:
            produto.preco = float(data.get('preco') or data.get('price'))
        except ValueError:
            return jsonify({'error': 'preço inválido'}), 400

    if 'estoque' in data or 'stock' in data:
        try:
            produto.estoque = int(data.get('estoque') or data.get('stock'))
        except ValueError:
            return jsonify({'error': 'estoque inválido'}), 400

    if 'imagem' in data or 'image' in data:
        produto.imagem = data.get('imagem') or data.get('image')

    if 'ativo' in data:
        produto.ativo = bool(data.get('ativo'))

    db.session.commit()

    return jsonify({
        'message': 'produto atualizado com sucesso',
        'produto': serialize_produto(produto),
    })


@bp.route('/produtos/<int:id>', methods=['DELETE'])
@login_required
def remover_produto(id):
    if current_user.tipo != 'fornecedor':
        return jsonify({
            'error': 'apenas fornecedores podem remover produtos'
        }), 403

    if not current_user.fornecedor:
        return jsonify({
            'error': 'perfil de fornecedor não encontrado'
        }), 404

    produto = Produto.query.get_or_404(id)

    if produto.fornecedor_id != current_user.fornecedor.id:
        return jsonify({'error': 'acesso negado'}), 403

    produto.ativo = False

    db.session.commit()

    return jsonify({
        'message': 'produto removido com sucesso'
    })


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
        'estado': e.estado,
    })


@bp.route('/empresas/<int:id>', methods=['PUT'])
def empresa_update(id):
    e = Empresa.query.get_or_404(id)
    data = request.json or {}

    for attr in (
        'nome',
        'foto_perfil',
        'descricao',
        'endereco',
        'telefone',
        'cidade',
        'estado',
    ):
        if attr in data:
            setattr(e, attr, data[attr])

    db.session.commit()

    return jsonify({'message': 'updated'})


# -----------------------
# Seguidores
# -----------------------

@bp.route('/empresas/<int:id>/seguir', methods=['POST'])
def seguir_empresa(id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')

    if not empresa_id:
        return jsonify({'error': 'empresa_id required'}), 400

    if empresa_id == id:
        return jsonify({'error': 'cannot follow self'}), 400

    if Seguidores.query.filter_by(
        empresa_id=empresa_id,
        seguindo_empresa_id=id,
    ).first():
        return jsonify({'message': 'already following'})

    s = Seguidores(
        empresa_id=empresa_id,
        seguindo_empresa_id=id,
    )

    db.session.add(s)
    db.session.commit()

    return jsonify({'id': s.id}), 201


@bp.route('/empresas/<int:id>/seguir', methods=['DELETE'])
def deixar_de_seguir(id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')

    if not empresa_id:
        return jsonify({'error': 'empresa_id required'}), 400

    s = Seguidores.query.filter_by(
        empresa_id=empresa_id,
        seguindo_empresa_id=id,
    ).first()

    if not s:
        return jsonify({'error': 'not following'}), 404

    db.session.delete(s)
    db.session.commit()

    return jsonify({'message': 'unfollowed'})


# -----------------------
# Grupos
# -----------------------

@bp.route('/grupos', methods=['GET'])
def list_grupos():
    grupos = Grupo.query.all()

    return jsonify([
        {
            'id': g.id,
            'nome': g.nome,
            'descricao': g.descricao,
            'foto_grupo': g.foto_grupo,
        }
        for g in grupos
    ])


@bp.route('/grupos/<int:grupo_id>/entrar', methods=['POST'])
def entrar_grupo(grupo_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')

    if not empresa_id:
        return jsonify({'error': 'empresa_id required'}), 400

    if EmpresaGrupo.query.filter_by(
        empresa_id=empresa_id,
        grupo_id=grupo_id,
    ).first():
        return jsonify({'message': 'already member'})

    eg = EmpresaGrupo(
        empresa_id=empresa_id,
        grupo_id=grupo_id,
    )

    db.session.add(eg)
    db.session.commit()

    return jsonify({'message': 'joined'})


@bp.route('/grupos/<int:grupo_id>/sair', methods=['POST'])
def sair_grupo(grupo_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')

    if not empresa_id:
        return jsonify({'error': 'empresa_id required'}), 400

    eg = EmpresaGrupo.query.filter_by(
        empresa_id=empresa_id,
        grupo_id=grupo_id,
    ).first()

    if not eg:
        return jsonify({'error': 'not a member'}), 404

    db.session.delete(eg)
    db.session.commit()

    return jsonify({'message': 'left'})


# -----------------------
# Chat de grupos
# -----------------------

def serialize_mensagem(m):
    is_own = False
    autor_nome = 'Usuário'
    autor_tipo = 'membro'

    if m.empresa:
        autor_nome = m.empresa.nome
        autor_tipo = 'mercado'

        if current_user.is_authenticated and current_user.tipo == 'mercado':
            if current_user.empresa and current_user.empresa.id == m.empresa_id:
                is_own = True

    if m.fornecedor:
        autor_nome = m.fornecedor.nome
        autor_tipo = 'fornecedor'

        if current_user.is_authenticated and current_user.tipo == 'fornecedor':
            if current_user.fornecedor and current_user.fornecedor.id == m.fornecedor_id:
                is_own = True

    return {
        'id': m.id,
        'mensagem': m.mensagem,
        'enviada_em': m.enviada_em.isoformat() if m.enviada_em else None,
        'empresa_id': m.empresa_id,
        'fornecedor_id': m.fornecedor_id,
        'autor_nome': autor_nome,
        'autor_tipo': autor_tipo,
        'isOwn': is_own,
    }


@bp.route('/chat/<int:grupo_id>/mensagens', methods=['GET', 'POST'])
@login_required
def chat_mensagens(grupo_id):
    grupo = Grupo.query.get(grupo_id)

    if not grupo:
        grupo = Grupo(
            id=grupo_id,
            nome='Grupo Geral',
            descricao='Grupo padrão para conversas',
        )

        db.session.add(grupo)
        db.session.flush()

    if request.method == 'GET':
        msgs = MensagemGrupo.query.filter_by(
            grupo_id=grupo.id
        ).order_by(
            MensagemGrupo.enviada_em.asc()
        ).all()

        return jsonify([
            serialize_mensagem(m)
            for m in msgs
        ])

    data = request.get_json(silent=True) or {}
    mensagem = (data.get('mensagem') or '').strip()

    if not mensagem:
        return jsonify({'error': 'mensagem obrigatória'}), 400

    empresa_id = None
    fornecedor_id = None

    if current_user.tipo == 'mercado':
        if not current_user.empresa:
            return jsonify({
                'error': 'perfil de mercado não encontrado'
            }), 404

        empresa_id = current_user.empresa.id

    elif current_user.tipo == 'fornecedor':
        if not current_user.fornecedor:
            return jsonify({
                'error': 'perfil de fornecedor não encontrado'
            }), 404

        fornecedor_id = current_user.fornecedor.id

    else:
        return jsonify({'error': 'tipo de usuário inválido'}), 400

    nova_mensagem = MensagemGrupo(
        grupo_id=grupo.id,
        mensagem=mensagem,
        empresa_id=empresa_id,
        fornecedor_id=fornecedor_id,
    )

    db.session.add(nova_mensagem)
    db.session.commit()

    mensagem_serializada = serialize_mensagem(nova_mensagem)

    socketio.emit(
        'nova_mensagem',
        {
            'grupo_id': grupo.id,
            'mensagem': mensagem_serializada,
        },
        room=f'grupo_{grupo.id}'
    )

    return jsonify({
        'message': 'mensagem enviada com sucesso',
        'mensagem': mensagem_serializada,
    }), 201

# -----------------------
# Pedidos e participações
# -----------------------

def serialize_pedido(p):
    total_quantidade = 0

    for part in p.participacoes:
        total_quantidade += part.quantidade

    minha_participacao = None

    if current_user.is_authenticated and current_user.tipo == 'mercado':
        if current_user.empresa:
            minha_participacao = ParticipacaoPedido.query.filter_by(
                pedido_id=p.id,
                empresa_id=current_user.empresa.id,
            ).first()

    is_lider = (
        current_user.is_authenticated and
        current_user.tipo == 'mercado' and
        current_user.empresa and
        p.empresa_criadora_id == current_user.empresa.id
    )

    return {
        'id': p.id,
        'grupo_id': p.grupo_id,
        'grupo_nome': p.grupo.nome if p.grupo else None,
        'fornecedor_id': p.fornecedor_id,
        'fornecedor_nome': p.fornecedor.nome if p.fornecedor else None,
        'empresa_criadora_id': p.empresa_criadora_id,
        'empresa_criadora_nome': p.empresa_criadora.nome if p.empresa_criadora else None,
        'is_lider': is_lider,
        'minha_participacao': (
            {
                'id': minha_participacao.id,
                'quantidade': minha_participacao.quantidade,
            }
            if minha_participacao else None
        ),
        'titulo': p.titulo,
        'status': p.status,
        'criado_em': p.criado_em.isoformat() if p.criado_em else None,
        'atualizado_em': p.atualizado_em.isoformat() if p.atualizado_em else None,
        'total_quantidade': total_quantidade,
        'itens': [
            {
                'id': it.id,
                'produto_id': it.produto_id,
                'produto_nome': it.produto.nome if it.produto else None,
                'produto_imagem': it.produto.imagem if it.produto else None,
                'quantidade': it.quantidade,
                'preco_unitario': float(it.preco_unitario),
            }
            for it in p.itens
        ],
        'participantes': [
            {
                'id': pp.id,
                'empresa_id': pp.empresa_id,
                'empresa_nome': pp.empresa.nome if pp.empresa else None,
                'quantidade': pp.quantidade,
            }
            for pp in p.participacoes
        ],
    }


@bp.route('/pedidos', methods=['POST'])
@login_required
def criar_pedido():
    if current_user.tipo != 'mercado':
        return jsonify({
            'error': 'apenas mercados podem criar pedidos'
        }), 403

    if not current_user.empresa:
        return jsonify({
            'error': 'perfil de mercado não encontrado'
        }), 404

    data = request.get_json(silent=True) or {}

    grupo_id = data.get('grupo_id') or 1
    produto_id = data.get('produto_id')
    quantidade = data.get('quantidade') or 1
    titulo = data.get('titulo')

    if not produto_id:
        return jsonify({'error': 'produto_id obrigatório'}), 400

    try:
        grupo_id = int(grupo_id)
        produto_id = int(produto_id)
        quantidade = int(quantidade)
    except ValueError:
        return jsonify({
            'error': 'grupo_id, produto_id e quantidade devem ser números'
        }), 400

    if quantidade <= 0:
        return jsonify({
            'error': 'quantidade deve ser maior que zero'
        }), 400

    produto = Produto.query.get(produto_id)

    if not produto or not produto.ativo:
        return jsonify({
            'error': 'produto não encontrado ou inativo'
        }), 404

    if quantidade > produto.estoque:
        return jsonify({
            'error': f'quantidade solicitada maior que o estoque disponível ({produto.estoque} unidades)'
        }), 400

    pedido_existente = Pedido.query.join(
        ItemPedido,
        ItemPedido.pedido_id == Pedido.id
    ).filter(
        Pedido.empresa_criadora_id == current_user.empresa.id,
        Pedido.status == 'ativo',
        ItemPedido.produto_id == produto.id
    ).first()

    if pedido_existente:
        participacao = ParticipacaoPedido.query.filter_by(
            pedido_id=pedido_existente.id,
            empresa_id=current_user.empresa.id,
        ).first()

        if not participacao:
            participacao = ParticipacaoPedido(
                pedido_id=pedido_existente.id,
                empresa_id=current_user.empresa.id,
                quantidade=0,
            )
            db.session.add(participacao)

        item_existente = pedido_existente.itens[0] if pedido_existente.itens else None

        participacao.quantidade = int(participacao.quantidade) + quantidade

        if item_existente:
            item_existente.quantidade = int(item_existente.quantidade) + quantidade

        produto.estoque = produto.estoque - quantidade

        db.session.commit()

        return jsonify({
            'message': 'quantidade adicionada ao pedido existente',
            'pedido': serialize_pedido(pedido_existente),
        }), 200

    grupo = Grupo.query.get(grupo_id)

    if not grupo:
        grupo = Grupo(
            id=grupo_id,
            nome='Grupo Geral',
            descricao='Grupo padrão para pedidos coletivos',
        )

        db.session.add(grupo)
        db.session.flush()

    pedido = Pedido(
        grupo_id=grupo.id,
        fornecedor_id=produto.fornecedor_id,
        empresa_criadora_id=current_user.empresa.id,
        titulo=titulo or produto.nome,
        status='ativo',
    )

    db.session.add(pedido)
    db.session.flush()

    item = ItemPedido(
        pedido_id=pedido.id,
        produto_id=produto.id,
        quantidade=quantidade,
        preco_unitario=produto.preco,
    )

    db.session.add(item)

    participacao = ParticipacaoPedido(
        pedido_id=pedido.id,
        empresa_id=current_user.empresa.id,
        quantidade=quantidade,
    )

    db.session.add(participacao)

    produto.estoque = produto.estoque - quantidade

    db.session.commit()

    return jsonify({
        'message': 'pedido criado com sucesso',
        'pedido': serialize_pedido(pedido),
    }), 201


@bp.route('/pedidos', methods=['GET'])
@login_required
def listar_pedidos():
    status = request.args.get('status')

    q = Pedido.query

    if current_user.tipo == 'mercado':
        if not current_user.empresa:
            return jsonify({
                'error': 'perfil de mercado não encontrado'
            }), 404

        q = q.filter(
            db.or_(
                Pedido.empresa_criadora_id == current_user.empresa.id,
                Pedido.participacoes.any(
                    ParticipacaoPedido.empresa_id == current_user.empresa.id
                ),
            )
        )

    elif current_user.tipo == 'fornecedor':
        if not current_user.fornecedor:
            return jsonify({
                'error': 'perfil de fornecedor não encontrado'
            }), 404

        q = q.filter_by(
            fornecedor_id=current_user.fornecedor.id
        )

    if status:
        q = q.filter_by(status=status)

    pedidos = q.order_by(
        Pedido.criado_em.desc()
    ).all()

    return jsonify([
        serialize_pedido(p)
        for p in pedidos
    ])

@bp.route('/pedidos/disponiveis', methods=['GET'])
@login_required
def listar_pedidos_disponiveis():
    if current_user.tipo != 'mercado':
        return jsonify({
            'error': 'apenas mercados podem visualizar pedidos disponíveis'
        }), 403

    if not current_user.empresa:
        return jsonify({
            'error': 'perfil de mercado não encontrado'
        }), 404

    pedidos = Pedido.query.filter(
        Pedido.status == 'ativo'
    ).order_by(
        Pedido.criado_em.desc()
    ).all()

    return jsonify([
        serialize_pedido(p)
        for p in pedidos
    ])

@bp.route('/pedidos/<int:pedido_id>/participar', methods=['POST'])
@login_required
def participar_pedido(pedido_id):
    if current_user.tipo != 'mercado':
        return jsonify({
            'error': 'apenas mercados podem participar de pedidos'
        }), 403

    if not current_user.empresa:
        return jsonify({
            'error': 'perfil de mercado não encontrado'
        }), 404

    data = request.get_json(silent=True) or {}

    quantidade = data.get('quantidade')

    if quantidade is None:
        return jsonify({
            'error': 'quantidade obrigatória'
        }), 400

    try:
        quantidade = int(quantidade)
    except ValueError:
        return jsonify({
            'error': 'quantidade inválida'
        }), 400

    if quantidade <= 0:
        return jsonify({
            'error': 'quantidade deve ser maior que zero'
        }), 400

    pedido = Pedido.query.get_or_404(pedido_id)

    if pedido.status != 'ativo':
        return jsonify({
            'error': 'pedido não está ativo'
        }), 400

    first_item = pedido.itens[0] if pedido.itens else None

    if not first_item or not first_item.produto:
        return jsonify({
            'error': 'produto do pedido não encontrado'
        }), 404

    part = ParticipacaoPedido.query.filter_by(
        pedido_id=pedido_id,
        empresa_id=current_user.empresa.id,
    ).first()

    quantidade_anterior = int(part.quantidade) if part else 0
    diferenca = quantidade - quantidade_anterior

    if diferenca > 0 and diferenca > first_item.produto.estoque:
        return jsonify({
            'error': f'quantidade adicional maior que o estoque disponível ({first_item.produto.estoque} unidades)'
        }), 400

    if part:
        part.quantidade = quantidade
    else:
        part = ParticipacaoPedido(
            pedido_id=pedido_id,
            empresa_id=current_user.empresa.id,
            quantidade=quantidade,
        )

        db.session.add(part)

    first_item.produto.estoque = first_item.produto.estoque - diferenca

    db.session.commit()

    return jsonify({
        'message': 'participação registrada com sucesso',
        'participacao': {
            'id': part.id,
            'pedido_id': part.pedido_id,
            'empresa_id': part.empresa_id,
            'quantidade': part.quantidade,
        },
        'pedido': serialize_pedido(pedido),
    }), 201

@bp.route('/pedidos/<int:pedido_id>/sair', methods=['POST'])
@login_required
def sair_pedido(pedido_id):
    if current_user.tipo != 'mercado':
        return jsonify({
            'error': 'apenas mercados podem sair de pedidos'
        }), 403

    if not current_user.empresa:
        return jsonify({
            'error': 'perfil de mercado não encontrado'
        }), 404

    pedido = Pedido.query.get_or_404(pedido_id)

    if pedido.status != 'ativo':
        return jsonify({
            'error': 'não é possível cancelar participação de um pedido que não está ativo'
        }), 400

    if pedido.empresa_criadora_id == current_user.empresa.id:
        return jsonify({
            'error': 'o líder do pedido não pode cancelar participação; cancele o pedido inteiro'
        }), 400

    participacao = ParticipacaoPedido.query.filter_by(
        pedido_id=pedido.id,
        empresa_id=current_user.empresa.id,
    ).first()

    if not participacao:
        return jsonify({
            'error': 'sua empresa não está participando deste pedido'
        }), 404

    quantidade_removida = int(participacao.quantidade)

    item = pedido.itens[0] if pedido.itens else None

    if item and item.produto:
        item.produto.estoque = item.produto.estoque + quantidade_removida

    db.session.delete(participacao)
    db.session.commit()

    return jsonify({
        'message': 'participação cancelada com sucesso',
        'pedido': serialize_pedido(pedido),
    })

@bp.route('/pedidos/<int:pedido_id>/cancelar', methods=['POST'])
@login_required
def cancelar_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)

    if pedido.status == 'finalizado':
        return jsonify({
            'error': 'pedido finalizado não pode ser cancelado'
        }), 400

    if current_user.tipo == 'mercado':
        if not current_user.empresa or pedido.empresa_criadora_id != current_user.empresa.id:
            return jsonify({'error': 'acesso negado'}), 403

    if pedido.status == 'cancelado':
        return jsonify({
            'message': 'pedido já estava cancelado',
            'pedido': serialize_pedido(pedido),
        })

    total_participacoes = 0

    for part in pedido.participacoes:
        total_participacoes += int(part.quantidade)

    for item in pedido.itens:
        if item.produto:
            item.produto.estoque = item.produto.estoque + total_participacoes

    pedido.status = 'cancelado'

    db.session.commit()

    return jsonify({
        'message': 'pedido cancelado com sucesso',
        'pedido': serialize_pedido(pedido),
    })


@bp.route('/pedidos/<int:pedido_id>/finalizar', methods=['POST'])
@login_required
def finalizar_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)

    if current_user.tipo != 'fornecedor':
        return jsonify({
            'error': 'apenas fornecedores podem finalizar pedidos'
        }), 403

    if not current_user.fornecedor or pedido.fornecedor_id != current_user.fornecedor.id:
        return jsonify({'error': 'acesso negado'}), 403

    pedido.status = 'finalizado'

    db.session.commit()

    return jsonify({
        'message': 'pedido finalizado com sucesso',
        'pedido': serialize_pedido(pedido),
    })


@bp.route('/pedidos/limpar-antigos', methods=['DELETE'])
@login_required
def limpar_pedidos_antigos():
    limite = datetime.utcnow() - timedelta(days=30)

    pedidos_antigos = Pedido.query.filter(
        Pedido.status.in_(['cancelado', 'finalizado']),
        Pedido.atualizado_em < limite,
    ).all()

    total = len(pedidos_antigos)

    for pedido in pedidos_antigos:
        db.session.delete(pedido)

    db.session.commit()

    return jsonify({
        'message': 'histórico antigo removido com sucesso',
        'total_removidos': total,
    })


# -----------------------
# Pagamentos
# -----------------------

@bp.route('/pedidos/<int:pedido_id>/pagamentos', methods=['POST'])
def criar_pagamento(pedido_id):
    data = request.json or {}
    empresa_id = data.get('empresa_id')
    valor = data.get('valor')

    if not empresa_id or valor is None:
        return jsonify({'error': 'empresa_id and valor required'}), 400

    pagamento = Pagamento(
        pedido_id=pedido_id,
        empresa_id=empresa_id,
        valor=valor,
    )

    db.session.add(pagamento)
    db.session.commit()

    return jsonify({'id': pagamento.id}), 201


# -----------------------
# Notificações e configurações
# -----------------------

@bp.route('/notificacoes', methods=['GET'])
def listar_notificacoes():
    usuario_id = request.args.get('usuario_id')

    if not usuario_id:
        return jsonify({'error': 'usuario_id required'}), 400

    nots = Notificacao.query.filter_by(
        usuario_id=usuario_id
    ).order_by(
        Notificacao.criada_em.desc()
    ).all()

    return jsonify([
        {
            'id': n.id,
            'titulo': n.titulo,
            'mensagem': n.mensagem,
            'lida': n.lida,
            'criada_em': n.criada_em.isoformat(),
        }
        for n in nots
    ])


@bp.route('/configuracao/<int:usuario_id>', methods=['GET', 'PUT'])
def configuracao_usuario(usuario_id):
    config = ConfiguracaoUsuario.query.filter_by(
        usuario_id=usuario_id
    ).first()

    if request.method == 'GET':
        if not config:
            return jsonify({
                'usuario_id': usuario_id,
                'receber_notificacoes': True,
                'tema': 'light',
            })

        return jsonify({
            'usuario_id': config.usuario_id,
            'receber_notificacoes': config.receber_notificacoes,
            'tema': config.tema,
        })

    data = request.json or {}

    if not config:
        config = ConfiguracaoUsuario(usuario_id=usuario_id)
        db.session.add(config)

    if 'receber_notificacoes' in data:
        config.receber_notificacoes = data['receber_notificacoes']

    if 'tema' in data:
        config.tema = data['tema']

    db.session.commit()

    return jsonify({'message': 'updated'})


# -----------------------
# Dashboards
# -----------------------

def calcular_total_pedido(pedido):
    total = 0

    for item in pedido.itens:
        total += float(item.preco_unitario) * int(item.quantidade)

    return total


@bp.route('/dashboard/mercado', methods=['GET'])
@login_required
def dashboard_mercado():
    if current_user.tipo != 'mercado':
        return jsonify({
            'error': 'apenas mercados podem acessar esta dashboard'
        }), 403

    if not current_user.empresa:
        return jsonify({
            'error': 'perfil de mercado não encontrado'
        }), 404

    empresa_id = current_user.empresa.id

    pedidos = Pedido.query.filter(
        db.or_(
            Pedido.empresa_criadora_id == empresa_id,
            Pedido.participacoes.any(
                ParticipacaoPedido.empresa_id == empresa_id
            ),
        ),
        Pedido.status != 'cancelado'
    ).order_by(
        Pedido.criado_em.desc()
    ).all()

    pedidos_criados_por_mim = []
    pedidos_participando = []
    pedidos_concluidos = []

    gasto_criados_por_mim = 0
    gasto_participando = 0
    gasto_concluidos = 0

    fornecedores_gastos = {}
    atividade_recente = []

    for pedido in pedidos:
        item = pedido.itens[0] if pedido.itens else None

        quantidade_empresa = 0

        for part in pedido.participacoes:
            if part.empresa_id == empresa_id:
                quantidade_empresa = int(part.quantidade)

        valor_empresa = 0

        if item and quantidade_empresa > 0:
            valor_empresa = float(item.preco_unitario) * quantidade_empresa

        foi_criado_por_mim = pedido.empresa_criadora_id == empresa_id
        estou_participando = (
            pedido.empresa_criadora_id != empresa_id and
            quantidade_empresa > 0
        )
        esta_concluido = pedido.status == 'finalizado'
        esta_ativo = pedido.status == 'ativo'

        if foi_criado_por_mim and esta_ativo:
            pedidos_criados_por_mim.append(pedido)
            gasto_criados_por_mim += valor_empresa

        if estou_participando and esta_ativo:
            pedidos_participando.append(pedido)
            gasto_participando += valor_empresa

        if esta_concluido:
            pedidos_concluidos.append(pedido)
            gasto_concluidos += valor_empresa

        if valor_empresa > 0:
            nome_fornecedor = (
                pedido.fornecedor.nome
                if pedido.fornecedor
                else 'Fornecedor'
            )

            fornecedores_gastos[nome_fornecedor] = fornecedores_gastos.get(
                nome_fornecedor,
                0
            ) + valor_empresa

        atividade_recente.append({
            'id': pedido.id,
            'titulo': pedido.titulo,
            'fornecedor_nome': pedido.fornecedor.nome if pedido.fornecedor else None,
            'produto_nome': item.produto.nome if item and item.produto else None,
            'quantidade': quantidade_empresa,
            'valor': valor_empresa,
            'status': pedido.status,
            'criado_em': pedido.criado_em.isoformat() if pedido.criado_em else None,
            'foi_criado_por_mim': foi_criado_por_mim,
            'estou_participando': estou_participando,
            'esta_concluido': esta_concluido,
            'tipo_dashboard': (
                'concluido' if esta_concluido
                else 'criado' if foi_criado_por_mim
                else 'participando' if estou_participando
                else 'outro'
            ),
        })

    fornecedores_mais_usados = [
        {
            'nome': nome,
            'valor': valor,
        }
        for nome, valor in sorted(
            fornecedores_gastos.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    ]

    gasto_total = (
        gasto_criados_por_mim +
        gasto_participando +
        gasto_concluidos
    )

    return jsonify({
        'pedidos_criados_por_mim': len(pedidos_criados_por_mim),
        'pedidos_ativos': len(pedidos_criados_por_mim),
        'participando': len(pedidos_participando),
        'concluidos': len(pedidos_concluidos),
        'total_pedidos': len(pedidos),
        'gasto_total': gasto_total,
        'gastos': {
            'criados_por_mim': gasto_criados_por_mim,
            'participando': gasto_participando,
            'concluidos': gasto_concluidos,
            'total': gasto_total,
        },
        'atividade_recente': atividade_recente[:10],
        'fornecedores_mais_usados': fornecedores_mais_usados,
    })


@bp.route('/dashboard/fornecedor', methods=['GET'])
@login_required
def dashboard_fornecedor():
    if current_user.tipo != 'fornecedor':
        return jsonify({
            'error': 'apenas fornecedores podem acessar esta dashboard'
        }), 403

    if not current_user.fornecedor:
        return jsonify({
            'error': 'perfil de fornecedor não encontrado'
        }), 404

    fornecedor_id = current_user.fornecedor.id

    pedidos = Pedido.query.filter_by(
        fornecedor_id=fornecedor_id
    ).order_by(
        Pedido.criado_em.desc()
    ).all()

    pedidos_pendentes = [
        p for p in pedidos
        if p.status == 'ativo'
    ]

    pedidos_confirmados = [
        p for p in pedidos
        if p.status == 'finalizado'
    ]

    total_itens = 0
    receita_total = 0
    clientes = {}
    produtos = {}
    cidades = {}

    for pedido in pedidos:
        item = pedido.itens[0] if pedido.itens else None

        for part in pedido.participacoes:
            quantidade = int(part.quantidade)
            total_itens += quantidade

            if item:
                valor = float(item.preco_unitario) * quantidade
                receita_total += valor

                produto_nome = item.produto.nome if item.produto else pedido.titulo

                produtos[produto_nome] = produtos.get(
                    produto_nome,
                    0
                ) + quantidade

            if part.empresa:
                clientes[part.empresa.nome] = clientes.get(
                    part.empresa.nome,
                    0
                ) + quantidade

                localidade = 'Não informado'

                if part.empresa.cidade and part.empresa.estado:
                    localidade = f'{part.empresa.cidade}/{part.empresa.estado}'
                elif part.empresa.cidade:
                    localidade = part.empresa.cidade
                elif part.empresa.estado:
                    localidade = part.empresa.estado

                cidades[localidade] = cidades.get(
                    localidade,
                    0
                ) + quantidade

    pedidos_recentes = []

    for pedido in pedidos[:5]:
        item = pedido.itens[0] if pedido.itens else None

        pedidos_recentes.append({
            'id': pedido.id,
            'titulo': pedido.titulo,
            'empresa_nome': pedido.empresa_criadora.nome if pedido.empresa_criadora else None,
            'quantidade': item.quantidade if item else 0,
            'valor': calcular_total_pedido(pedido),
            'status': pedido.status,
            'criado_em': pedido.criado_em.isoformat() if pedido.criado_em else None,
        })

    produtos_mais_vendidos = [
        {
            'nome': nome,
            'quantidade': quantidade,
        }
        for nome, quantidade in sorted(
            produtos.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    ]

    clientes_top = [
        {
            'nome': nome,
            'quantidade': quantidade,
        }
        for nome, quantidade in sorted(
            clientes.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    ]

    localidades_top = [
        {
            'nome': nome,
            'quantidade': quantidade,
        }
        for nome, quantidade in sorted(
            cidades.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    ]

    return jsonify({
        'pedidos_pendentes': len(pedidos_pendentes),
        'pedidos_confirmados': len(pedidos_confirmados),
        'total_itens': total_itens,
        'receita_total': receita_total,
        'pedidos_recentes': pedidos_recentes,
        'produtos_mais_vendidos': produtos_mais_vendidos,
        'clientes_top': clientes_top,
        'localidades_top': localidades_top,
    })

@socketio.on('entrar_grupo')
def socket_entrar_grupo(data):
    grupo_id = data.get('grupo_id')

    if not grupo_id:
        return

    join_room(f'grupo_{grupo_id}')


@socketio.on('sair_grupo')
def socket_sair_grupo(data):
    grupo_id = data.get('grupo_id')

    if not grupo_id:
        return

    leave_room(f'grupo_{grupo_id}')