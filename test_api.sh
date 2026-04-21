#!/bin/bash

# Script de Testes da API Amalgama
# Este script testa todos os endpoints da API

API_URL="http://localhost:5000"

echo "================================================"
echo "TESTE DA API BANCO DE DADOS AMALGAMA"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para fazer requisições e validar resposta
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testando: $description${NC}"
    echo "URL: $API_URL$endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$API_URL$endpoint")
    else
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    echo "Resposta: $response"
    echo ""
}

# 1. Teste de Status
echo -e "${GREEN}1. TESTE DE STATUS DA API${NC}"
test_endpoint "GET" "/" "" "Status da API"

# 2. Listar Empresas
echo -e "${GREEN}2. LISTAR EMPRESAS${NC}"
test_endpoint "GET" "/empresas" "" "Listar todas as empresas"

# 3. Criar Nova Empresa
echo -e "${GREEN}3. CRIAR NOVA EMPRESA${NC}"
test_endpoint "POST" "/empresas" \
    '{"nome":"Mercado Novo","endereco":"Rua Nova 1","contato":"novo@mercado.com"}' \
    "Criar empresa"

# 4. Listar Grupos
echo -e "${GREEN}4. LISTAR GRUPOS${NC}"
test_endpoint "GET" "/grupos" "" "Listar todos os grupos"

# 5. Criar Novo Grupo
echo -e "${GREEN}5. CRIAR NOVO GRUPO${NC}"
test_endpoint "POST" "/grupos" \
    '{"nome":"Grupo Novo","descricao":"Novo grupo de compras"}' \
    "Criar grupo"

# 6. Listar Fornecedores
echo -e "${GREEN}6. LISTAR FORNECEDORES${NC}"
test_endpoint "GET" "/fornecedores" "" "Listar todos os fornecedores"

# 7. Criar Novo Fornecedor
echo -e "${GREEN}7. CRIAR NOVO FORNECEDOR${NC}"
test_endpoint "POST" "/fornecedores" \
    '{"nome":"Fornecedor Novo","endereco":"Av Nova 999","contato":"novo@fornecedor.com"}' \
    "Criar fornecedor"

# 8. Listar Produtos
echo -e "${GREEN}8. LISTAR PRODUTOS${NC}"
test_endpoint "GET" "/produtos" "" "Listar todos os produtos"

# 9. Criar Novo Produto
echo -e "${GREEN}9. CRIAR NOVO PRODUTO${NC}"
test_endpoint "POST" "/produtos" \
    '{"nome":"Produto Novo","descricao":"Produto de teste","preco_unitario":15.50,"fornecedor_id":1}' \
    "Criar produto"

# 10. Listar Pedidos
echo -e "${GREEN}10. LISTAR PEDIDOS${NC}"
test_endpoint "GET" "/pedidos" "" "Listar todos os pedidos"

# 11. Criar Novo Pedido
echo -e "${GREEN}11. CRIAR NOVO PEDIDO${NC}"
test_endpoint "POST" "/pedidos" \
    '{"grupo_id":1,"fornecedor_id":1}' \
    "Criar pedido"

echo -e "${GREEN}================================================${NC}"
echo "TESTES CONCLUÍDOS!"
echo "Para mais informações, consulte API_DOCS.md"
echo "================================================"
