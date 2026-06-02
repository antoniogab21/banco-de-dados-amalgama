from datetime import datetime
from flask_login import UserMixin
from sqlalchemy import UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from .extensions import db, bcrypt


# ==========================================
# USUÁRIO
# ==========================================

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    senha_hash = db.Column(
        db.String(255),
        nullable=False
    )

    tipo = db.Column(
        db.Enum(
            'mercado',
            'fornecedor',
            name='tipo_usuario'
        ),
        nullable=False
    )

    tipo_definido = db.Column(
        db.Boolean,
        default=False
    )

    ativo = db.Column(
        db.Boolean,
        default=True
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def set_password(self, senha_plain):
        self.senha_hash = bcrypt.generate_password_hash(
            senha_plain
        ).decode('utf-8')

    def check_password(self, senha_plain):
        return bcrypt.check_password_hash(
            self.senha_hash,
            senha_plain
        )

    empresa = relationship(
        'Empresa',
        uselist=False,
        back_populates='usuario',
        cascade='all, delete-orphan'
    )

    fornecedor = relationship(
        'Fornecedor',
        uselist=False,
        back_populates='usuario',
        cascade='all, delete-orphan'
    )

    configuracao = relationship(
        'ConfiguracaoUsuario',
        uselist=False,
        back_populates='usuario',
        cascade='all, delete-orphan'
    )

    notificacoes = relationship(
        'Notificacao',
        back_populates='usuario',
        cascade='all, delete-orphan'
    )


# ==========================================
# EMPRESA / MERCADO
# ==========================================

class Empresa(db.Model):
    __tablename__ = 'empresa'

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuario.id'),
        unique=True,
        nullable=False
    )

    nome = db.Column(
        db.String(255),
        nullable=False
    )

    cnpj = db.Column(
        db.String(14),
        unique=True,
        nullable=False
    )

    foto_perfil = db.Column(db.Text)

    descricao = db.Column(db.Text)

    endereco = db.Column(db.String(255))

    telefone = db.Column(db.String(20))

    cidade = db.Column(db.String(100))

    estado = db.Column(db.String(100))

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    usuario = relationship(
        'Usuario',
        back_populates='empresa'
    )

    grupos = relationship(
        'Grupo',
        secondary='empresa_grupo',
        back_populates='empresas'
    )

    seguidores = relationship(
        'Seguidores',
        foreign_keys='Seguidores.empresa_id',
        back_populates='empresa',
        cascade='all, delete-orphan'
    )

    seguindo = relationship(
        'Seguidores',
        foreign_keys='Seguidores.seguindo_empresa_id',
        back_populates='seguindo_empresa',
        cascade='all, delete-orphan'
    )

    pedidos_criados = relationship(
        'Pedido',
        back_populates='empresa_criadora'
    )

    participacoes = relationship(
        'ParticipacaoPedido',
        back_populates='empresa',
        cascade='all, delete-orphan'
    )

    pagamentos = relationship(
        'Pagamento',
        back_populates='empresa',
        cascade='all, delete-orphan'
    )

    mensagens = relationship(
        'MensagemGrupo',
        back_populates='empresa'
    )


# ==========================================
# FORNECEDOR
# ==========================================

class Fornecedor(db.Model):
    __tablename__ = 'fornecedor'

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuario.id'),
        unique=True,
        nullable=False
    )

    nome = db.Column(
        db.String(255),
        nullable=False
    )

    cnpj = db.Column(
        db.String(14),
        unique=True,
        nullable=False
    )

    foto_perfil = db.Column(db.Text)

    descricao = db.Column(db.Text)

    endereco = db.Column(db.String(255))

    telefone = db.Column(db.String(20))

    cidade = db.Column(db.String(100))

    estado = db.Column(db.String(100))

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    usuario = relationship(
        'Usuario',
        back_populates='fornecedor'
    )

    produtos = relationship(
        'Produto',
        back_populates='fornecedor',
        cascade='all, delete-orphan'
    )

    pedidos = relationship(
        'Pedido',
        back_populates='fornecedor'
    )

    mensagens = relationship(
        'MensagemGrupo',
        back_populates='fornecedor'
    )


# ==========================================
# PRODUTOS
# ==========================================

class Produto(db.Model):
    __tablename__ = 'produto'

    id = db.Column(db.Integer, primary_key=True)

    fornecedor_id = db.Column(
        db.Integer,
        db.ForeignKey('fornecedor.id'),
        nullable=False
    )

    nome = db.Column(
        db.String(255),
        nullable=False
    )

    descricao = db.Column(db.Text)

    preco = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    estoque = db.Column(
        db.Integer,
        default=0
    )

    imagem = db.Column(db.Text)

    ativo = db.Column(
        db.Boolean,
        default=True
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    fornecedor = relationship(
        'Fornecedor',
        back_populates='produtos'
    )

    itens_pedido = relationship(
        'ItemPedido',
        back_populates='produto'
    )

    movimentacoes = relationship(
        'MovimentacaoEstoque',
        back_populates='produto',
        cascade='all, delete-orphan'
    )


# ==========================================
# GRUPOS
# ==========================================

class Grupo(db.Model):
    __tablename__ = 'grupo'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome = db.Column(
        db.String(255),
        nullable=False
    )

    descricao = db.Column(db.Text)

    foto_grupo = db.Column(db.Text)

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    empresas = relationship(
        'Empresa',
        secondary='empresa_grupo',
        back_populates='grupos'
    )

    mensagens = relationship(
        'MensagemGrupo',
        back_populates='grupo',
        cascade='all, delete-orphan'
    )

    pedidos = relationship(
        'Pedido',
        back_populates='grupo'
    )


# ==========================================
# EMPRESA X GRUPO
# ==========================================

class EmpresaGrupo(db.Model):
    __tablename__ = 'empresa_grupo'

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    grupo_id = db.Column(
        db.Integer,
        db.ForeignKey('grupo.id'),
        nullable=False
    )

    entrou_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        PrimaryKeyConstraint(
            'empresa_id',
            'grupo_id',
            name='pk_empresa_grupo'
        ),
    )


# ==========================================
# PEDIDOS
# ==========================================

class Pedido(db.Model):
    __tablename__ = 'pedido'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    grupo_id = db.Column(
        db.Integer,
        db.ForeignKey('grupo.id'),
        nullable=False
    )

    fornecedor_id = db.Column(
        db.Integer,
        db.ForeignKey('fornecedor.id'),
        nullable=False
    )

    empresa_criadora_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    titulo = db.Column(db.String(255))

    status = db.Column(
        db.Enum(
            'ativo',
            'cancelado',
            'finalizado',
            name='pedido_status'
        ),
        default='ativo'
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    grupo = relationship(
        'Grupo',
        back_populates='pedidos'
    )

    fornecedor = relationship(
        'Fornecedor',
        back_populates='pedidos'
    )

    empresa_criadora = relationship(
        'Empresa',
        back_populates='pedidos_criados'
    )

    itens = relationship(
        'ItemPedido',
        back_populates='pedido',
        cascade='all, delete-orphan'
    )

    participacoes = relationship(
        'ParticipacaoPedido',
        back_populates='pedido',
        cascade='all, delete-orphan'
    )

    pagamentos = relationship(
        'Pagamento',
        back_populates='pedido',
        cascade='all, delete-orphan'
    )


# ==========================================
# ITENS DOS PEDIDOS
# ==========================================

class ItemPedido(db.Model):
    __tablename__ = 'item_pedido'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey('pedido.id'),
        nullable=False
    )

    produto_id = db.Column(
        db.Integer,
        db.ForeignKey('produto.id'),
        nullable=False
    )

    quantidade = db.Column(
        db.Integer,
        nullable=False
    )

    preco_unitario = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    pedido = relationship(
        'Pedido',
        back_populates='itens'
    )

    produto = relationship(
        'Produto',
        back_populates='itens_pedido'
    )


# ==========================================
# PARTICIPAÇÃO NO PEDIDO
# ==========================================

class ParticipacaoPedido(db.Model):
    __tablename__ = 'participacao_pedido'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey('pedido.id'),
        nullable=False
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    quantidade = db.Column(
        db.Integer,
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    pedido = relationship(
        'Pedido',
        back_populates='participacoes'
    )

    empresa = relationship(
        'Empresa',
        back_populates='participacoes'
    )


# ==========================================
# CHAT DOS GRUPOS
# ==========================================

class MensagemGrupo(db.Model):
    __tablename__ = 'mensagem_grupo'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    grupo_id = db.Column(
        db.Integer,
        db.ForeignKey('grupo.id'),
        nullable=False
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=True
    )

    fornecedor_id = db.Column(
        db.Integer,
        db.ForeignKey('fornecedor.id'),
        nullable=True
    )

    mensagem = db.Column(
        db.Text,
        nullable=False
    )

    enviada_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    grupo = relationship(
        'Grupo',
        back_populates='mensagens'
    )

    empresa = relationship(
        'Empresa',
        back_populates='mensagens'
    )

    fornecedor = relationship(
        'Fornecedor',
        back_populates='mensagens'
    )


# ==========================================
# SEGUIR EMPRESAS
# ==========================================

class Seguidores(db.Model):
    __tablename__ = 'seguidores'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    seguindo_empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            'empresa_id',
            'seguindo_empresa_id',
            name='uq_seguidores'
        ),
    )

    empresa = relationship(
        'Empresa',
        foreign_keys=[empresa_id],
        back_populates='seguidores'
    )

    seguindo_empresa = relationship(
        'Empresa',
        foreign_keys=[seguindo_empresa_id],
        back_populates='seguindo'
    )


# ==========================================
# MOVIMENTAÇÃO DE ESTOQUE
# ==========================================

class MovimentacaoEstoque(db.Model):
    __tablename__ = 'movimentacao_estoque'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    produto_id = db.Column(
        db.Integer,
        db.ForeignKey('produto.id'),
        nullable=False
    )

    tipo = db.Column(
        db.Enum(
            'entrada',
            'saida',
            name='tipo_movimentacao'
        ),
        nullable=False
    )

    quantidade = db.Column(
        db.Integer,
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    produto = relationship(
        'Produto',
        back_populates='movimentacoes'
    )


# ==========================================
# NOTIFICAÇÕES
# ==========================================

class Notificacao(db.Model):
    __tablename__ = 'notificacao'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuario.id'),
        nullable=False
    )

    titulo = db.Column(db.String(255))

    mensagem = db.Column(db.Text)

    lida = db.Column(
        db.Boolean,
        default=False
    )

    criada_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    usuario = relationship(
        'Usuario',
        back_populates='notificacoes'
    )


# ==========================================
# PAGAMENTO
# ==========================================

class Pagamento(db.Model):
    __tablename__ = 'pagamento'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey('pedido.id'),
        nullable=False
    )

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey('empresa.id'),
        nullable=False
    )

    valor = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    status = db.Column(
        db.Enum(
            'pendente',
            'pago',
            'cancelado',
            name='pagamento_status'
        ),
        default='pendente'
    )

    pago_em = db.Column(
        db.DateTime,
        nullable=True
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    pedido = relationship(
        'Pedido',
        back_populates='pagamentos'
    )

    empresa = relationship(
        'Empresa',
        back_populates='pagamentos'
    )


# ==========================================
# CONFIGURAÇÃO USUÁRIO
# ==========================================

class ConfiguracaoUsuario(db.Model):
    __tablename__ = 'configuracao_usuario'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuario.id'),
        nullable=False,
        unique=True
    )

    receber_notificacoes = db.Column(
        db.Boolean,
        default=True
    )

    tema = db.Column(
        db.String(50),
        default='light'
    )

    usuario = relationship(
        'Usuario',
        back_populates='configuracao'
    )