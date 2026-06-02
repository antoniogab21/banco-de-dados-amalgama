-- =========================================================
-- AMALGAMA DATABASE
-- MYSQL 8+
-- =========================================================

DROP DATABASE IF EXISTS amalgama;

CREATE DATABASE amalgama
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE amalgama;

-- =========================================================
-- USUARIO
-- =========================================================

CREATE TABLE usuario (

    id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,

    senha_hash VARCHAR(255) NOT NULL,

    tipo ENUM(
        'mercado',
        'fornecedor'
    ) NOT NULL,

    ativo BOOLEAN DEFAULT TRUE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- EMPRESA
-- =========================================================

CREATE TABLE empresa (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,

    nome VARCHAR(255) NOT NULL,

    cnpj CHAR(14) NOT NULL UNIQUE,

    foto_perfil TEXT,

    descricao TEXT,

    endereco VARCHAR(255),

    telefone VARCHAR(20),

    cidade VARCHAR(100),

    estado VARCHAR(100),

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- =========================================================
-- FORNECEDOR
-- =========================================================

CREATE TABLE fornecedor (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,

    nome VARCHAR(255) NOT NULL,

    cnpj CHAR(14) NOT NULL UNIQUE,

    foto_perfil TEXT,

    descricao TEXT,

    endereco VARCHAR(255),

    telefone VARCHAR(20),

    cidade VARCHAR(100),

    estado VARCHAR(100),

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- =========================================================
-- SEGUIR EMPRESAS
-- =========================================================

CREATE TABLE seguidores (

    id INT AUTO_INCREMENT PRIMARY KEY,

    empresa_id INT NOT NULL,

    seguindo_empresa_id INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE,

    FOREIGN KEY (seguindo_empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE,

    UNIQUE (
        empresa_id,
        seguindo_empresa_id
    )
);

-- =========================================================
-- GRUPOS
-- =========================================================

CREATE TABLE grupo (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(255) NOT NULL,

    descricao TEXT,

    foto_grupo TEXT,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- EMPRESA_GRUPO
-- =========================================================

CREATE TABLE empresa_grupo (

    empresa_id INT NOT NULL,

    grupo_id INT NOT NULL,

    entrou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        empresa_id,
        grupo_id
    ),

    FOREIGN KEY (empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE,

    FOREIGN KEY (grupo_id)
    REFERENCES grupo(id)
    ON DELETE CASCADE
);

-- =========================================================
-- PRODUTOS
-- =========================================================

CREATE TABLE produto (

    id INT AUTO_INCREMENT PRIMARY KEY,

    fornecedor_id INT NOT NULL,

    nome VARCHAR(255) NOT NULL,

    descricao TEXT,

    preco DECIMAL(10,2) NOT NULL,

    estoque INT DEFAULT 0,

    imagem TEXT,

    ativo BOOLEAN DEFAULT TRUE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedor(id)
    ON DELETE CASCADE
);

-- =========================================================
-- MOVIMENTACAO ESTOQUE
-- =========================================================

CREATE TABLE movimentacao_estoque (

    id INT AUTO_INCREMENT PRIMARY KEY,

    produto_id INT NOT NULL,

    tipo ENUM(
        'entrada',
        'saida'
    ) NOT NULL,

    quantidade INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id)
    REFERENCES produto(id)
    ON DELETE CASCADE
);

-- =========================================================
-- PEDIDOS
-- =========================================================

CREATE TABLE pedido (

    id INT AUTO_INCREMENT PRIMARY KEY,

    grupo_id INT NOT NULL,

    fornecedor_id INT NOT NULL,

    empresa_criadora_id INT NOT NULL,

    titulo VARCHAR(255),

    status ENUM(
        'ativo',
        'cancelado',
        'finalizado'
    ) DEFAULT 'ativo',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (grupo_id)
    REFERENCES grupo(id)
    ON DELETE CASCADE,

    FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedor(id)
    ON DELETE CASCADE,

    FOREIGN KEY (empresa_criadora_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE
);

-- =========================================================
-- ITEM PEDIDO
-- =========================================================

CREATE TABLE item_pedido (

    id INT AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT NOT NULL,

    produto_id INT NOT NULL,

    quantidade INT NOT NULL,

    preco_unitario DECIMAL(10,2) NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pedido_id)
    REFERENCES pedido(id)
    ON DELETE CASCADE,

    FOREIGN KEY (produto_id)
    REFERENCES produto(id)
    ON DELETE CASCADE
);

-- =========================================================
-- PARTICIPACAO PEDIDO
-- =========================================================

CREATE TABLE participacao_pedido (

    id INT AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT NOT NULL,

    empresa_id INT NOT NULL,

    quantidade INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pedido_id)
    REFERENCES pedido(id)
    ON DELETE CASCADE,

    FOREIGN KEY (empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE
);

-- =========================================================
-- MENSAGENS DOS GRUPOS
-- =========================================================

CREATE TABLE mensagem_grupo (

    id INT AUTO_INCREMENT PRIMARY KEY,

    grupo_id INT NOT NULL,

    empresa_id INT NULL,

    fornecedor_id INT NULL,

    mensagem TEXT NOT NULL,

    enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (grupo_id)
    REFERENCES grupo(id)
    ON DELETE CASCADE,

    FOREIGN KEY (empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE,

    FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedor(id)
    ON DELETE CASCADE
);

-- =========================================================
-- PAGAMENTOS
-- =========================================================

CREATE TABLE pagamento (

    id INT AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT NOT NULL,

    empresa_id INT NOT NULL,

    valor DECIMAL(10,2) NOT NULL,

    status ENUM(
        'pendente',
        'pago',
        'cancelado'
    ) DEFAULT 'pendente',

    pago_em TIMESTAMP NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pedido_id)
    REFERENCES pedido(id)
    ON DELETE CASCADE,

    FOREIGN KEY (empresa_id)
    REFERENCES empresa(id)
    ON DELETE CASCADE
);

-- =========================================================
-- NOTIFICACOES
-- =========================================================

CREATE TABLE notificacao (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    titulo VARCHAR(255),

    mensagem TEXT,

    lida BOOLEAN DEFAULT FALSE,

    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- =========================================================
-- CONFIGURACOES
-- =========================================================

CREATE TABLE configuracao_usuario (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,

    receber_notificacoes BOOLEAN DEFAULT TRUE,

    tema VARCHAR(50) DEFAULT 'light',

    FOREIGN KEY (usuario_id)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- =========================================================
-- INDICES
-- =========================================================

CREATE INDEX idx_usuario_email
ON usuario(email);

CREATE INDEX idx_empresa_nome
ON empresa(nome);

CREATE INDEX idx_empresa_cnpj
ON empresa(cnpj);

CREATE INDEX idx_fornecedor_nome
ON fornecedor(nome);

CREATE INDEX idx_fornecedor_cnpj
ON fornecedor(cnpj);

CREATE INDEX idx_produto_nome
ON produto(nome);

CREATE INDEX idx_pedido_status
ON pedido(status);

CREATE INDEX idx_pagamento_status
ON pagamento(status);

CREATE INDEX idx_mensagem_grupo
ON mensagem_grupo(grupo_id);

CREATE INDEX idx_seguidores_empresa
ON seguidores(empresa_id);

CREATE INDEX idx_seguidores_seguindo
ON seguidores(seguindo_empresa_id);