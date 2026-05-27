from flask import Flask, render_template

app = Flask(
    __name__,
    template_folder='templates',
    static_folder='static'
)
@app.route('/')
def login():
    return render_template('login.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/painel')
def painel():
    return render_template('painel.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/pedidos')
def pedidos():
    return render_template('pedidos.html')

@app.route('/perfil')
def perfil():
    return render_template('perfil.html')

@app.route('/pagamentos')
def pagamentos():
    return render_template('pagamentos.html')

@app.route('/configuracoes')
def configuracoes():
    return render_template('configuracoes.html')

if __name__ == '__main__':
    app.run(debug=True)