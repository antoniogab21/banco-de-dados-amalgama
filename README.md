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

## Aplicação Web (API REST)
Uma aplicação simples em Python com Flask foi criada para interagir com o banco de dados via API REST.

### Pré-requisitos
- Python 3.7+
- MySQL Server
- Dependências: `pip install -r requirements.txt`

### Configuração
1. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

2. Configure as variáveis de ambiente (opcional, padrões já definidos):
   - `DB_HOST`: Host do banco (padrão: localhost)
   - `DB_USER`: Usuário do banco (padrão: root)
   - `DB_PASSWORD`: Senha do banco (padrão: vazio)
   - `DB_NAME`: Nome do banco (padrão: amalgama)

3. Execute o schema SQL no MySQL:
   ```
   mysql -u root -p < schema.sql
   ```

### Executando a Aplicação
```
python app.py
```
A API estará disponível em `http://localhost:5000`.

### Endpoints da API
- `GET /`: Mensagem de boas-vindas.
- `GET /empresas`: Lista todas as empresas.
- `POST /empresas`: Cria uma nova empresa (JSON: `{"nome": "Nome", "endereco": "Endereço", "contato": "Contato"}`).
- `GET /grupos`: Lista todos os grupos.
- `POST /grupos`: Cria um novo grupo (JSON: `{"nome": "Nome", "descricao": "Descrição"}`).
- `POST /grupos/<id>/empresas`: Associa uma empresa a um grupo (JSON: `{"empresa_id": 1}`).
- `GET /pedidos`: Lista todos os pedidos com detalhes.
- `POST /pedidos`: Cria um novo pedido (JSON: `{"grupo_id": 1, "fornecedor_id": 1}`).
- `POST /pedidos/<id>/itens`: Adiciona item ao pedido (JSON: `{"produto_id": 1, "quantidade_total": 100}`).
- `POST /itens/<id>/rateio`: Adiciona rateio a um item (JSON: `{"empresa_id": 1, "quantidade_rateada": 50, "custo_rateado": 250.00}`).
- `GET /pedidos/<id>/relatorio`: Relatório de custos por empresa no pedido.

### Testando a API
Use ferramentas como Postman, curl ou Insomnia para testar os endpoints. Por exemplo:
```
curl -X GET http://localhost:5000/empresas
```

## Tecnologias
- MySQL (ou MariaDB) para o banco de dados relacional.
- Python com Flask para a API REST.
