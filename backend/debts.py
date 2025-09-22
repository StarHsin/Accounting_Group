# backend/debts.py
from flask import Blueprint, request, jsonify
from .config import db

bp = Blueprint("debts", __name__)


@bp.route("/", methods=["POST"])
def add_debt():
    data = request.json
    group_id = data.get("group_id")
    payer = data.get("payer")
    receiver = data.get("receiver")
    amount = data.get("amount")

    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document()
    debt_ref.set({
        "payer": payer,
        "receiver": receiver,
        "amount": amount
    })
    return jsonify({"id": debt_ref.id, "payer": payer, "receiver": receiver, "amount": amount})


@bp.route("/<group_id>", methods=["GET"])
def list_debts(group_id):
    debts = []
    for doc in db.collection("groups").document(group_id).collection("debts").stream():
        d = doc.to_dict()
        d["id"] = doc.id
        debts.append(d)
    return jsonify(debts)
