# Banco de Dados Amalgama

## Descrição
Sistema de banco de dados para permitir que pequenos mercados se organizem em grupos de compra, consolidem pedidos em um "pedido único" para o fornecedor e depois rateiem quantidades e custos por empresa.

## Objetivo
Facilitar compras coletivas entre pequenos mercados, reduzindo custos através da consolidação de pedidos e distribuição equitativa dos encargos.

## Estrutura do Banco de Dados
O esquema do banco está definido no arquivo `schema.sql`, que inclui as seguintes tabelas principais:

- **Empresa**: Representa os pequenos mercados participantes.
- **Grupo**: Grupos de compra formados pelas empresas.
- **Empresa_Grupo**: Relacionamento muitos-para-muitos entre empresas e grupos.
- **Fornecedor**: Fornecedores de produtos.
- **Produto**: Produtos oferecidos pelos fornecedores.
- **Pedido**: Pedidos consolidados enviados aos fornecedores.
- **Item_Pedido**: Itens individuais dos pedidos consolidados.
- **Rateio**: Divisão de quantidades e custos por empresa participante.

## Como Usar
1. Execute o script `schema.sql` em um servidor MySQL para criar o banco de dados.
2. Insira dados conforme necessário para empresas, grupos, fornecedores e produtos.
3. Para um novo pedido:
   - Crie um pedido associado a um grupo e fornecedor.
   - Adicione itens ao pedido com quantidades totais.
   - Para cada item, crie registros de rateio atribuindo quantidades e custos às empresas participantes.

## Exemplos de Consultas
Veja o arquivo `queries.sql` para exemplos de consultas SQL que demonstram como inserir dados, consultar informações e gerar relatórios.

## Tecnologias
- MySQL (ou MariaDB) para o banco de dados relacional.
