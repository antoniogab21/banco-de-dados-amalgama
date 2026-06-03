from flask import Flask, render_template

from backend.config import Config
from backend.extensions import db, migrate, login_manager, bcrypt, socketio
from backend.auth import bp as auth_bp
from backend.api import bp as api_bp


def create_app():
    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='static'
    )

    app.config.from_object(Config)

    # initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(app)

    # register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    # preserve existing routes
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

    return app


if __name__ == '__main__':
    app = create_app()
    socketio.run(
        app,
        host='0.0.0.0',
        port=5001,
        debug=True,
        allow_unsafe_werkzeug=True
    )