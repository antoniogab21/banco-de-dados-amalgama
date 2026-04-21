-- Banco de Dados: Amalgama - Sistema de Compras Coletivas para Pequenos Mercados
-- Objetivo: Permitir que pequenos mercados se organizem em grupos de compra,
-- consolidem pedidos em um "pedido único" para o fornecedor e rateiem quantidades e custos por empresa.

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS amalgama;
USE amalgama;

-- Tabela: Empresa (representa os pequenos mercados)
CREATE TABLE empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(500),
    contato VARCHAR(255), -- email ou telefone
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Grupo (grupos de compra)
CREATE TABLE grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento: Empresa_Grupo (muitos-para-muitos)
CREATE TABLE empresa_grupo (
    empresa_id INT,
    grupo_id INT,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (empresa_id, grupo_id),
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE CASCADE
);

-- Tabela: Fornecedor
CREATE TABLE fornecedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(500),
    contato VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Produto
CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    fornecedor_id INT,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE SET NULL
);

-- Tabela: Pedido (pedido consolidado para o fornecedor)
CREATE TABLE pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT,
    fornecedor_id INT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'enviado', 'recebido', 'cancelado') DEFAULT 'pendente',
    FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE CASCADE
);

-- Tabela: Item_Pedido (itens do pedido consolidado)
CREATE TABLE item_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    produto_id INT,
    quantidade_total INT NOT NULL, -- quantidade total solicitada pelo grupo
    FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- Tabela: Rateio (divisão de quantidades e custos por empresa)
CREATE TABLE rateio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_pedido_id INT,
    empresa_id INT,
    quantidade_rateada INT NOT NULL, -- quantidade atribuída a esta empresa
    custo_rateado DECIMAL(10, 2), -- custo calculado para esta empresa (pode ser calculado como (quantidade_rateada / quantidade_total) * (preco_unitario * quantidade_total))
    FOREIGN KEY (item_pedido_id) REFERENCES item_pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX idx_empresa_grupo_empresa ON empresa_grupo(empresa_id);
CREATE INDEX idx_empresa_grupo_grupo ON empresa_grupo(grupo_id);
CREATE INDEX idx_pedido_grupo ON pedido(grupo_id);
CREATE INDEX idx_pedido_fornecedor ON pedido(fornecedor_id);
CREATE INDEX idx_item_pedido_pedido ON item_pedido(pedido_id);
CREATE INDEX idx_item_pedido_produto ON item_pedido(produto_id);
CREATE INDEX idx_rateio_item ON rateio(item_pedido_id);
CREATE INDEX idx_rateio_empresa ON rateio(empresa_id);

-- Exemplo de inserção de dados (opcional, para teste)
-- INSERT INTO empresa (nome, endereco, contato) VALUES ('Mercado A', 'Rua 1, Cidade', 'contato@mercadoa.com');
-- INSERT INTO grupo (nome, descricao) VALUES ('Grupo Centro', 'Grupo de mercados do centro');
-- INSERT INTO fornecedor (nome, endereco, contato) VALUES ('Fornecedor X', 'Av. Principal, Cidade', 'vendas@fornecedorx.com');
-- INSERT INTO produto (nome, descricao, preco_unitario, fornecedor_id) VALUES ('Produto 1', 'Descrição do produto', 10.50, 1);