from flask import Blueprint, request, jsonify
import sqlite3

cart_bp = Blueprint("cart", __name__)

DB = "Bellavita_Oven.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


# GET CART
@cart_bp.route("/cart/<user_id>", methods=["GET"])
def get_cart(user_id):

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT cake_id,price,qty,image FROM cart WHERE user_id=?",
        (user_id,)
    )

    rows = cur.fetchall()

    cart = []

    for r in rows:
        cart.append({
            "id": r["cake_id"],
            "price": r["price"],
            "qty": r["qty"],
            "img": r["image"]
        })

    conn.close()

    return jsonify(cart)


# ADD / UPDATE CART
@cart_bp.route("/cart/add", methods=["POST"])
def add_cart():

    data = request.get_json()

    user = data.get("user_id")
    cake = data.get("id")
    price = data.get("price")
    qty = data.get("qty")
    img = data.get("img")

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT qty FROM cart WHERE user_id=? AND cake_id=?",
        (user, cake)
    )

    row = cur.fetchone()

    if row:
        cur.execute(
            "UPDATE cart SET qty=?,price=?,image=? WHERE user_id=? AND cake_id=?",
            (qty, price, img, user, cake)
        )
    else:
        cur.execute(
            "INSERT INTO cart(user_id,cake_id,price,qty,image) VALUES(?,?,?,?,?)",
            (user, cake, price, qty, img)
        )

    conn.commit()
    conn.close()

    return jsonify({"status": "updated"})


# REMOVE ITEM
@cart_bp.route("/cart/remove", methods=["POST"])
def remove_cart():

    data = request.get_json()

    user = data.get("user_id")
    cake = data.get("id")

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM cart WHERE user_id=? AND cake_id=?",
        (user, cake)
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "removed"})