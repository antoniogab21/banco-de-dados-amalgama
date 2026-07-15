from flask import Flask, jsonify, render_template
from flask_cors import CORS

from backend.config import Config
from backend.extensions import bcrypt, db, login_manager, migrate, socketio
from backend.auth import bp as auth_bp
from backend.api import bp as api_bp


def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    app.config.from_object(Config)

    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(app, cors_allowed_origins=allowed_origins)

    login_manager.login_view = "login"

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "authentication required"}), 401

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/")
    def login():
        return render_template("login.html")

    @app.get("/cadastro")
    def cadastro():
        return render_template("cadastro.html")

    @app.get("/painel")
    def painel():
        return render_template("painel.html")

    @app.get("/chat")
    def chat():
        return render_template("chat.html")

    @app.get("/pedidos")
    def pedidos():
        return render_template("pedidos.html")

    @app.get("/perfil")
    def perfil():
        return render_template("perfil.html")

    @app.get("/pagamentos")
    def pagamentos():
        return render_template("pagamentos.html")

    @app.get("/configuracoes")
    def configuracoes():
        return render_template("configuracoes.html")

    return app


if __name__ == "__main__":
    app = create_app()

    socketio.run(
        app,
        host="0.0.0.0",
        port=5001,
        debug=True,
        allow_unsafe_werkzeug=True,
    )