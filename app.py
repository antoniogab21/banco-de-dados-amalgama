from flask import Flask, request, jsonify
import mysql.connector
import os
from dotenv import load_dotenv
from mysql.connector import Error

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
    try:
        return mysql.connector.connect(**db_config)
    except Error as err:
        if err.errno == 2003:
            return {'error': 'Erro de conexão: MySQL não está rodando'}
        elif err.errno == 1049:
            return {'error': 'Banco de dados não existe'}
        else:
            return {'error': f'Erro de conexão: {err}'}

@app.route('/')
def index():
    return jsonify({'message': 'API do Banco Amalgama - Sistema de Compras Coletivas'})

# Rotas para Empresas
@app.route('/empresas', methods=['GET'])
def listar_empresas():
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM empresa")
        empresas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(empresas)
    except Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/empresas', methods=['POST'])
def criar_empresa():
    try:
        data = request.get_json()
        if not data or 'nome' not in data:
            return jsonify({'error': 'Campo "nome" é obrigatório'}), 400
        
        nome = data['nome']
        endereco = data.get('endereco', '')
        contato = data.get('contato', '')

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO empresa (nome, endereco, contato) VALUES (%s, %s, %s)",
                       (nome, endereco, contato))
        conn.commit()
        empresa_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': empresa_id, 'message': 'Empresa criada com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Grupos
@app.route('/grupos', methods=['GET'])
def listar_grupos():
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM grupo")
        grupos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(grupos)
    except Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/grupos', methods=['POST'])
def criar_grupo():
    try:
        data = request.get_json()
        if not data or 'nome' not in data:
            return jsonify({'error': 'Campo "nome" é obrigatório'}), 400
        
        nome = data['nome']
        descricao = data.get('descricao', '')

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO grupo (nome, descricao) VALUES (%s, %s)", (nome, descricao))
        conn.commit()
        grupo_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': grupo_id, 'message': 'Grupo criado com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Associar empresa a grupo
@app.route('/grupos/<int:grupo_id>/empresas', methods=['POST'])
def associar_empresa_grupo(grupo_id):
    try:
        data = request.get_json()
        if not data or 'empresa_id' not in data:
            return jsonify({'error': 'Campo "empresa_id" é obrigatório'}), 400
        
        empresa_id = data['empresa_id']

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO empresa_grupo (empresa_id, grupo_id) VALUES (%s, %s)",
                       (empresa_id, grupo_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Empresa associada ao grupo com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Pedidos
@app.route('/pedidos', methods=['GET'])
def listar_pedidos():
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
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
    except Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/pedidos', methods=['POST'])
def criar_pedido():
    try:
        data = request.get_json()
        if not data or 'grupo_id' not in data or 'fornecedor_id' not in data:
            return jsonify({'error': 'Campos "grupo_id" e "fornecedor_id" são obrigatórios'}), 400
        
        grupo_id = data['grupo_id']
        fornecedor_id = data['fornecedor_id']

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO pedido (grupo_id, fornecedor_id) VALUES (%s, %s)",
                       (grupo_id, fornecedor_id))
        conn.commit()
        pedido_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': pedido_id, 'message': 'Pedido criado com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Itens de Pedido
@app.route('/pedidos/<int:pedido_id>/itens', methods=['POST'])
def adicionar_item_pedido(pedido_id):
    try:
        data = request.get_json()
        if not data or 'produto_id' not in data or 'quantidade_total' not in data:
            return jsonify({'error': 'Campos "produto_id" e "quantidade_total" são obrigatórios'}), 400

        produto_id = data['produto_id']
        quantidade_total = data['quantidade_total']

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO item_pedido (pedido_id, produto_id, quantidade_total) VALUES (%s, %s, %s)",
                       (pedido_id, produto_id, quantidade_total))
        conn.commit()
        item_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': item_id, 'message': 'Item adicionado ao pedido'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Rateio
@app.route('/itens/<int:item_id>/rateio', methods=['POST'])
def adicionar_rateio(item_id):
    try:
        data = request.get_json()
        if not data or 'empresa_id' not in data or 'quantidade_rateada' not in data or 'custo_rateado' not in data:
            return jsonify({'error': 'Campos "empresa_id", "quantidade_rateada" e "custo_rateado" são obrigatórios'}), 400

        empresa_id = data['empresa_id']
        quantidade_rateada = data['quantidade_rateada']
        custo_rateado = data['custo_rateado']

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO rateio (item_pedido_id, empresa_id, quantidade_rateada, custo_rateado) VALUES (%s, %s, %s, %s)",
                       (item_id, empresa_id, quantidade_rateada, custo_rateado))
        conn.commit()
        rateio_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': rateio_id, 'message': 'Rateio adicionado com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Fornecedores
@app.route('/fornecedores', methods=['GET'])
def listar_fornecedores():
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM fornecedor")
        fornecedores = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(fornecedores)
    except Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/fornecedores', methods=['POST'])
def criar_fornecedor():
    try:
        data = request.get_json()
        if not data or 'nome' not in data:
            return jsonify({'error': 'Campo "nome" é obrigatório'}), 400
        
        nome = data['nome']
        endereco = data.get('endereco', '')
        contato = data.get('contato', '')

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO fornecedor (nome, endereco, contato) VALUES (%s, %s, %s)",
                       (nome, endereco, contato))
        conn.commit()
        fornecedor_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': fornecedor_id, 'message': 'Fornecedor criado com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Rotas para Produtos
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, f.nome AS fornecedor_nome
            FROM produto p
            LEFT JOIN fornecedor f ON p.fornecedor_id = f.id
        """)
        produtos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(produtos)
    except Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/produtos', methods=['POST'])
def criar_produto():
    try:
        data = request.get_json()
        if not data or 'nome' not in data or 'preco_unitario' not in data:
            return jsonify({'error': 'Campos "nome" e "preco_unitario" são obrigatórios'}), 400
        
        nome = data['nome']
        descricao = data.get('descricao', '')
        preco_unitario = data['preco_unitario']
        fornecedor_id = data.get('fornecedor_id')

        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor()
        cursor.execute("INSERT INTO produto (nome, descricao, preco_unitario, fornecedor_id) VALUES (%s, %s, %s, %s)",
                       (nome, descricao, preco_unitario, fornecedor_id))
        conn.commit()
        produto_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'id': produto_id, 'message': 'Produto criado com sucesso'}), 201
    except Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as err:
        return jsonify({'error': str(err)}), 400

# Relatório de custos por empresa em um pedido
@app.route('/pedidos/<int:pedido_id>/relatorio', methods=['GET'])
def relatorio_pedido(pedido_id):
    try:
        conn = get_db_connection()
        if isinstance(conn, dict) and 'error' in conn:
            return jsonify(conn), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.nome AS empresa, SUM(r.custo_rateado) AS custo_total, COUNT(r.id) AS quantidade_itens
            FROM rateio r
            JOIN empresa e ON r.empresa_id = e.id
            JOIN item_pedido ip ON r.item_pedido_id = ip.id
            WHERE ip.pedido_id = %s
            GROUP BY e.id, e.nome
        """, (pedido_id,))
        relatorio = cursor.fetchall()
        cursor.close()
        
        # Adicionar total geral
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT SUM(r.custo_rateado) AS custo_total_geral
            FROM rateio r
            JOIN item_pedido ip ON r.item_pedido_id = ip.id
            WHERE ip.pedido_id = %s
        """, (pedido_id,))
        total = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({'itens': relatorio, 'total_geral': total['custo_total_geral'] or 0})
    except Error as err:
        return jsonify({'error': str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)