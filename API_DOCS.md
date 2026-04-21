# Documentação da API REST - Banco Amalgama

## Endpoints Disponíveis

### Status da API
- **GET** `/` - Verifica se a API está operacional

### Empresas
- **GET** `/empresas` - Lista todas as empresas
- **POST** `/empresas` - Cria uma nova empresa
  ```json
  {
    "nome": "Mercado ABC",
    "endereco": "Rua 1, Cidade",
    "contato": "email@mercado.com"
  }
  ```

### Grupos
- **GET** `/grupos` - Lista todos os grupos de compra
- **POST** `/grupos` - Cria um novo grupo
  ```json
  {
    "nome": "Grupo Centro",
    "descricao": "Grupo de mercados da região central"
  }
  ```
- **POST** `/grupos/<grupo_id>/empresas` - Associa uma empresa a um grupo
  ```json
  {
    "empresa_id": 1
  }
  ```

### Fornecedores
- **GET** `/fornecedores` - Lista todos os fornecedores
- **POST** `/fornecedores` - Cria um novo fornecedor
  ```json
  {
    "nome": "Fornecedor XYZ",
    "endereco": "Av. Principal, Cidade",
    "contato": "vendas@fornecedor.com"
  }
  ```

### Produtos
- **GET** `/produtos` - Lista todos os produtos
- **POST** `/produtos` - Cria um novo produto
  ```json
  {
    "nome": "Arroz 5kg",
    "descricao": "Arroz integral de alta qualidade",
    "preco_unitario": 25.50,
    "fornecedor_id": 1
  }
  ```

### Pedidos
- **GET** `/pedidos` - Lista todos os pedidos consolidados
- **POST** `/pedidos` - Cria um novo pedido
  ```json
  {
    "grupo_id": 1,
    "fornecedor_id": 1
  }
  ```

### Itens de Pedido
- **POST** `/pedidos/<pedido_id>/itens` - Adiciona um item a um pedido
  ```json
  {
    "produto_id": 1,
    "quantidade_total": 100
  }
  ```

### Rateio
- **POST** `/itens/<item_id>/rateio` - Distribui um item entre empresas
  ```json
  {
    "empresa_id": 1,
    "quantidade_rateada": 25,
    "custo_rateado": 637.50
  }
  ```

### Relatórios
- **GET** `/pedidos/<pedido_id>/relatorio` - Gera relatório de custos por empresa

## Exemplos de Uso

### 1. Criar uma empresa
```bash
curl -X POST http://localhost:5000/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mercado do Bairro",
    "endereco": "Rua das Flores, 123",
    "contato": "contato@mercadobairro.com"
  }'
```

### 2. Criar um grupo
```bash
curl -X POST http://localhost:5000/grupos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Grupo Regional",
    "descricao": "Grupo de compra regional"
  }'
```

### 3. Associar empresa ao grupo
```bash
curl -X POST http://localhost:5000/grupos/1/empresas \
  -H "Content-Type: application/json" \
  -d '{"empresa_id": 1}'
```

### 4. Criar fornecedor
```bash
curl -X POST http://localhost:5000/fornecedores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Distribuidora Central",
    "endereco": "Av. Industrial, 456",
    "contato": "vendas@distrib.com"
  }'
```

### 5. Criar produto
```bash
curl -X POST http://localhost:5000/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Feijão 1kg",
    "descricao": "Feijão carioca de primeira qualidade",
    "preco_unitario": 8.50,
    "fornecedor_id": 1
  }'
```

### 6. Criar pedido consolidado
```bash
curl -X POST http://localhost:5000/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "grupo_id": 1,
    "fornecedor_id": 1
  }'
```

### 7. Adicionar item ao pedido
```bash
curl -X POST http://localhost:5000/pedidos/1/itens \
  -H "Content-Type: application/json" \
  -d '{
    "produto_id": 1,
    "quantidade_total": 50
  }'
```

### 8. Registrar rateio
```bash
curl -X POST http://localhost:5000/itens/1/rateio \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": 1,
    "quantidade_rateada": 25,
    "custo_rateado": 212.50
  }'
```

### 9. Obter relatório do pedido
```bash
curl -X GET http://localhost:5000/pedidos/1/relatorio
```

## Códigos de Resposta HTTP

- **200 OK** - Requisição bem-sucedida
- **201 Created** - Recurso criado com sucesso
- **400 Bad Request** - Erro de validação ou dados obrigatórios faltando
- **500 Internal Server Error** - Erro no servidor ou conexão com banco de dados

## Autenticação

Atualmente, a API não possui autenticação. Para uso em produção, implemente:
- JWT (JSON Web Tokens)
- OAuth2
- API Keys

## Configuração

### Variáveis de Ambiente (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=amalgama
FLASK_ENV=development
FLASK_DEBUG=True
```

## Instalação e Execução

1. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configurar banco de dados:**
   ```bash
   mysql -u root < schema.sql
   mysql -u root amalgama < dados_exemplo.sql
   ```

3. **Executar aplicação:**
   ```bash
   python app.py
   ```

A API estará disponível em `http://localhost:5000`

## Observações

- O servidor atual é apenas para desenvolvimento
- Para produção, use um servidor WSGI como Gunicorn ou uWSGI
- Implemente validações de entrada mais rigorosas
- Adicione autenticação e autorização
- Configure CORS se necessário para frontend
- Implemente rate limiting para proteger contra abuso
