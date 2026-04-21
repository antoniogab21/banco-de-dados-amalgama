from flask import Flask, request, jsonify
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do .env

app = Flask(__name__)

# Configuração do banco de dados
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'amalgama')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/')
def index():
    return jsonify({'message': 'API do Banco Amalgama - Sistema de Compras Coletivas'})

# Rotas para Empresas
@app.route('/empresas', methods=['GET'])
def listar_empresas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM empresa")
    empresas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(empresas)

@app.route('/empresas', methods=['POST'])
def criar_empresa():
    data = request.get_json()
    nome = data['nome']
    endereco = data.get('endereco', '')
    contato = data.get('contato', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO empresa (nome, endereco, contato) VALUES (%s, %s, %s)",
                   (nome, endereco, contato))
    conn.commit()
    empresa_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': empresa_id, 'message': 'Empresa criada com sucesso'}), 201

# Rotas para Grupos
@app.route('/grupos', methods=['GET'])
def listar_grupos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM grupo")
    grupos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(grupos)

@app.route('/grupos', methods=['POST'])
def criar_grupo():
    data = request.get_json()
    nome = data['nome']
    descricao = data.get('descricao', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO grupo (nome, descricao) VALUES (%s, %s)", (nome, descricao))
    conn.commit()
    grupo_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': grupo_id, 'message': 'Grupo criado com sucesso'}), 201

# Associar empresa a grupo
@app.route('/grupos/<int:grupo_id>/empresas', methods=['POST'])
def associar_empresa_grupo(grupo_id):
    data = request.get_json()
    empresa_id = data['empresa_id']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO empresa_grupo (empresa_id, grupo_id) VALUES (%s, %s)",
                   (empresa_id, grupo_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Empresa associada ao grupo com sucesso'}), 201

# Rotas para Pedidos
@app.route('/pedidos', methods=['GET'])
def listar_pedidos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, g.nome AS grupo_nome, f.nome AS fornecedor_nome
        FROM pedido p
        JOIN grupo g ON p.grupo_id = g.id
        JOIN fornecedor f ON p.fornecedor_id = f.id
    """)
    pedidos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pedidos)

@app.route('/pedidos', methods=['POST'])
def criar_pedido():
    data = request.get_json()
    grupo_id = data['grupo_id']
    fornecedor_id = data['fornecedor_id']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO pedido (grupo_id, fornecedor_id) VALUES (%s, %s)",
                   (grupo_id, fornecedor_id))
    conn.commit()
    pedido_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': pedido_id, 'message': 'Pedido criado com sucesso'}), 201

# Rotas para Itens de Pedido
@app.route('/pedidos/<int:pedido_id>/itens', methods=['POST'])
def adicionar_item_pedido(pedido_id):
    data = request.get_json()
    produto_id = data['produto_id']
    quantidade_total = data['quantidade_total']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO item_pedido (pedido_id, produto_id, quantidade_total) VALUES (%s, %s, %s)",
                   (pedido_id, produto_id, quantidade_total))
    conn.commit()
    item_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': item_id, 'message': 'Item adicionado ao pedido'}), 201

# Rotas para Rateio
@app.route('/itens/<int:item_id>/rateio', methods=['POST'])
def adicionar_rateio(item_id):
    data = request.get_json()
    empresa_id = data['empresa_id']
    quantidade_rateada = data['quantidade_rateada']
    custo_rateado = data['custo_rateado']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado) VALUES (%s, %s, %s, %s)",
                   (item_id, empresa_id, quantidade_rateada, custo_rateado))
    conn.commit()
    rateio_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': rateio_id, 'message': 'Rateio adicionado com sucesso'}), 201

# Relatório de custos por empresa em um pedido
@app.route('/pedidos/<int:pedido_id>/relatorio', methods=['GET'])
def relatorio_pedido(pedido_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.nome AS empresa, SUM(r.custo_rateado) AS custo_total
        FROM rateio r
        JOIN empresa e ON r.empresa_id = e.id
        JOIN item_pedido ip ON r.item_pedido_id = ip.id
        WHERE ip.pedido_id = %s
        GROUP BY e.id, e.nome
    """, (pedido_id,))
    relatorio = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(relatorio)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)