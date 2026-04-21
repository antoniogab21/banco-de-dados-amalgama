-- Exemplos de Consultas SQL para o Banco Amalgama

-- 1. Listar todas as empresas em um grupo específico
SELECT e.nome AS empresa, eg.data_entrada
FROM empresa e
JOIN empresa_grupo eg ON e.id = eg.empresa_id
WHERE eg.grupo_id = 1; -- Substitua pelo ID do grupo

-- 2. Ver pedidos pendentes de um grupo
SELECT p.id, p.data_pedido, f.nome AS fornecedor, p.status
FROM pedido p
JOIN fornecedor f ON p.fornecedor_id = f.id
WHERE p.grupo_id = 1 AND p.status = 'pendente'; -- Substitua pelo ID do grupo

-- 3. Calcular o custo total de um item de pedido e seu rateio
SELECT ip.id, pr.nome AS produto, ip.quantidade_total, pr.preco_unitario,
       (ip.quantidade_total * pr.preco_unitario) AS custo_total,
       r.empresa_id, e.nome AS empresa, r.quantidade_rateada,
       r.custo_rateado
FROM item_pedido ip
JOIN produto pr ON ip.produto_id = pr.id
JOIN rateio r ON ip.id = r.item_pedido_id
JOIN empresa e ON r.empresa_id = e.id
WHERE ip.id = 1; -- Substitua pelo ID do item de pedido

-- 4. Inserir um novo pedido
-- Primeiro, inserir o pedido
INSERT INTO pedido (grupo_id, fornecedor_id, status) VALUES (1, 1, 'pendente');
-- Obter o ID do pedido inserido (assumindo auto_increment)
SET @pedido_id = LAST_INSERT_ID();

-- Inserir itens no pedido
INSERT INTO item_pedido (pedido_id, produto_id, quantidade_total) VALUES (@pedido_id, 1, 100);

-- Inserir rateios para as empresas (exemplo para duas empresas)
INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado)
VALUES (LAST_INSERT_ID(), 1, 50, 525.00), -- Supondo preço unitário 10.50
       (LAST_INSERT_ID(), 2, 50, 525.00);

-- 5. Atualizar status do pedido
UPDATE pedido SET status = 'enviado' WHERE id = 1;

-- 6. Relatório de custos por empresa em um pedido
SELECT e.nome AS empresa, SUM(r.custo_rateado) AS custo_total
FROM rateio r
JOIN empresa e ON r.empresa_id = e.id
JOIN item_pedido ip ON r.item_pedido_id = ip.id
WHERE ip.pedido_id = 1
GROUP BY e.id, e.nome;