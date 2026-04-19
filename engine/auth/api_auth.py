from flask import Blueprint, request, jsonify
from engine.auth.google_auth import verify_google_token
from engine.auth.session import create_session, validate_session, delete_session
from engine.db import get_user_by_email, create_google_user

auth_api = Blueprint("auth_api", __name__)


@auth_api.route("/google-login", methods=["POST"])
def api_google_login():

    data = request.json
    id_token_str = data.get("token")

    user = verify_google_token(id_token_str)

    if not user:
        return jsonify({"status": "error"})

    existing = get_user_by_email(user["email"])

    if not existing:
        create_google_user(
            name=user["name"],
            email=user["email"]
        )

    token = create_session(user["email"])

    return jsonify({
        "status": "success",
        "token": token
    })


@auth_api.route("/profile", methods=["POST"])
def api_get_profile():

    data = request.json
    token = data.get("token")

    email = validate_session(token)

    if not email:
        return jsonify({"status": "error"})

    user = get_user_by_email(email)

    return jsonify({
        "status": "success",
        "profile": user
    })


@auth_api.route("/logout", methods=["POST"])
def api_logout():

    data = request.json
    token = data.get("token")

    if token:
        delete_session(token)

    return jsonify({"status": "success"})