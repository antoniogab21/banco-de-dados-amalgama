-- Dados de exemplo para o Banco Amalgama

USE amalgama;

-- Inserir empresas (mercados)
INSERT INTO empresa (nome, endereco, contato) VALUES
('Mercado Central', 'Rua das Flores, 123', 'contato@mercadocentral.com'),
('Mini Mercado Silva', 'Av. Brasil, 456', 'silva@minimercado.com'),
('Loja do João', 'Praça da República, 789', 'joao@lojadojoao.com');

-- Inserir grupos
INSERT INTO grupo (nome, descricao) VALUES
('Grupo Centro', 'Grupo de mercados do centro da cidade para compras coletivas');

-- Associar empresas ao grupo
INSERT INTO empresa_grupo (empresa_id, grupo_id) VALUES
(1, 1),
(2, 1),
(3, 1);

-- Inserir fornecedores
INSERT INTO fornecedor (nome, endereco, contato) VALUES
('Distribuidora ABC', 'Rodovia BR-101, Km 50', 'vendas@distribuidoraabc.com');

-- Inserir produtos
INSERT INTO produto (nome, descricao, preco_unitario, fornecedor_id) VALUES
('Arroz 5kg', 'Arroz branco tipo 1', 25.00, 1),
('Feijão 1kg', 'Feijão carioca', 8.50, 1),
('Óleo de Soja 900ml', 'Óleo vegetal', 6.00, 1);

-- Inserir um pedido consolidado
INSERT INTO pedido (grupo_id, fornecedor_id, status) VALUES (1, 1, 'pendente');

-- Obter o ID do pedido
SET @pedido_id = LAST_INSERT_ID();

-- Inserir itens no pedido
INSERT INTO item_pedido (pedido_id, produto_id, quantidade_total) VALUES
(@pedido_id, 1, 50), -- 50 sacos de arroz
(@pedido_id, 2, 100), -- 100 kg de feijão
(@pedido_id, 3, 30); -- 30 garrafas de óleo

-- Rateio para o arroz (50 sacos): Mercado Central 20, Mini Mercado 15, Loja do João 15
INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado) VALUES
(LAST_INSERT_ID() - 2, 1, 20, 500.00), -- 20 * 25.00
(LAST_INSERT_ID() - 2, 2, 15, 375.00), -- 15 * 25.00
(LAST_INSERT_ID() - 2, 3, 15, 375.00); -- 15 * 25.00

-- Rateio para o feijão (100 kg): Mercado Central 40, Mini Mercado 30, Loja do João 30
INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado) VALUES
(LAST_INSERT_ID() - 1, 1, 40, 340.00), -- 40 * 8.50
(LAST_INSERT_ID() - 1, 2, 30, 255.00), -- 30 * 8.50
(LAST_INSERT_ID() - 1, 3, 30, 255.00); -- 30 * 8.50

-- Rateio para o óleo (30 garrafas): Mercado Central 12, Mini Mercado 9, Loja do João 9
INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado) VALUES
(LAST_INSERT_ID(), 1, 12, 72.00), -- 12 * 6.00
(LAST_INSERT_ID(), 2, 9, 54.00), -- 9 * 6.00
(LAST_INSERT_ID(), 3, 9, 54.00); -- 9 * 6.00