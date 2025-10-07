# backend/debts.py
from flask import Blueprint, request, jsonify
from .config import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import logging
from datetime import datetime

bp = Blueprint("debts", __name__)


@bp.route("/", methods=["POST"])
def add_debt():
    data = request.json
    group_id = data.get("group_id")
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document()

    payer_list = data.get("payer", [])
    for p in payer_list:
        if "paid" not in p:
            p["paid"] = False

    debt_data = {
        "payer": payer_list,
        "receiver": data.get("receiver"),
        "amount": data.get("amount"),
        "note": data.get("note"),
        "installment": data.get("installment"),
        "current": data.get("current"),
        "due_date": data.get("due_date"),
        "paid": False,
        "createdAt": SERVER_TIMESTAMP,
        "payments": [],
    }

    debt_ref.set(debt_data)
    saved_doc = debt_ref.get()
    saved_data = saved_doc.to_dict()
    saved_data["id"] = debt_ref.id
    return jsonify(saved_data), 201


@bp.route("/<group_id>", methods=["GET"])
def list_debts(group_id):
    debts = []
    for doc in db.collection("groups").document(group_id).collection("debts").stream():
        d = doc.to_dict()
        d["id"] = doc.id
        debts.append(d)
    return jsonify(debts)


@bp.route("/<group_id>/<debt_id>", methods=["PUT"])
def update_debt(group_id, debt_id):
    data = request.json
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)

    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    debt_doc = debt_ref.get().to_dict()
    updated = False

    if "markAllPaid" in data:
        for p in debt_doc.get("payer", []):
            p["paid"] = True
        debt_doc["paid"] = True
        updated = True
    elif "markPayerPaid" in data:
        payer_uid = data["markPayerPaid"]
        all_paid = True
        for p in debt_doc.get("payer", []):
            if p["uid"] == payer_uid:
                p["paid"] = True
            if not p.get("paid", False):
                all_paid = False
        if all_paid:
            debt_doc["paid"] = True
        updated = True
    else:
        debt_ref.update(data)
        updated_doc = debt_ref.get().to_dict()
        updated_doc["id"] = debt_id
        return jsonify(updated_doc)

    if updated:
        debt_ref.set(debt_doc)
        debt_doc["id"] = debt_id
        return jsonify(debt_doc)

    return jsonify({"error": "No valid update data"}), 400


@bp.route("/<group_id>/<debt_id>", methods=["DELETE"])
def delete_debt(group_id, debt_id):
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)
    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    debt_ref.delete()
    return jsonify({"success": True, "id": debt_id})


@bp.route("/stats/<group_id>", methods=["GET"])
def debt_stats(group_id):
    try:
        debts_ref = db.collection("groups").document(
            group_id).collection("debts")
        debts = []
        for doc in debts_ref.stream():
            d = doc.to_dict()
            if "amount" in d and d["amount"] is not None:
                try:
                    d["amount"] = float(d["amount"])
                except Exception:
                    d["amount"] = 0.0
            if "payer" in d:
                for p in d["payer"]:
                    if "paid" not in p:
                        p["paid"] = False
            debts.append(d)

        debt_by_member = {}
        receive_by_member = {}
        payments_by_member = {}

        total_debt = 0.0
        total_receive = 0.0

        for d in debts:
            payer_list = d.get("payer", [])
            receiver = d.get("receiver")
            amount = float(d.get("amount") or 0)
            if not receiver or "uid" not in receiver:
                continue
            receiver_uid = receiver["uid"]

            installment = int(d.get("installment") or 0)
            current = int(d.get("current") or 0)
            if installment > 0 and current > installment:
                current = installment

            for p in payer_list:
                uid = p.get("uid")
                if not uid:
                    continue

                if installment > 0:
                    remaining_amount = amount * max(0, (installment - current))
                    paid_amount = amount * current
                    paid_count = current
                else:
                    remaining_amount = amount if not p.get(
                        "paid", False) else 0.0
                    paid_amount = amount if p.get("paid", False) else 0.0
                    paid_count = 1 if p.get("paid", False) else 0

                if remaining_amount > 0:
                    debt_by_member[uid] = debt_by_member.get(
                        uid, 0) + remaining_amount
                    receive_by_member[receiver_uid] = receive_by_member.get(
                        receiver_uid, 0) + remaining_amount
                    total_debt += remaining_amount

                if paid_amount > 0:
                    total_receive += paid_amount

                payments_by_member[uid] = payments_by_member.get(
                    uid, 0) + paid_count

        biggest_debtor_id = max(
            debt_by_member, key=debt_by_member.get, default=None) if debt_by_member else None
        biggest_creditor_id = max(
            receive_by_member, key=receive_by_member.get, default=None) if receive_by_member else None
        biggest_payer_id = max(payments_by_member, key=payments_by_member.get,
                               default=None) if payments_by_member else None

        def maybe_int(v):
            return int(v) if isinstance(v, float) and v.is_integer() else v

        debt_by_member = {k: maybe_int(v) for k, v in debt_by_member.items()}
        receive_by_member = {k: maybe_int(v)
                             for k, v in receive_by_member.items()}
        payments_by_member = {k: int(v) for k, v in payments_by_member.items()}

        return jsonify({
            "totalDebt": maybe_int(total_debt),
            "totalReceive": maybe_int(total_receive),
            "debtByMember": debt_by_member,
            "receiveByMember": receive_by_member,
            "paymentsByMember": payments_by_member,
            "biggestDebtorId": biggest_debtor_id,
            "biggestCreditorId": biggest_creditor_id,
            "biggestPayerId": biggest_payer_id
        })

    except Exception as e:
        logging.error(f"Error in debt_stats for group {group_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


# 🔹 優化：使用 collection group query
@bp.route("/installments/<uid>", methods=["GET"])
def get_installment_debts(uid):
    try:
        result = []

        # 先找出使用者所屬的群組
        groups_ref = db.collection("groups").stream()
        group_ids = []

        for g in groups_ref:
            group_data = g.to_dict()
            members = group_data.get("members", [])
            if any(m.get("uid") == uid for m in members):
                group_ids.append(g.id)

        # 只查詢這些群組的債務
        for group_id in group_ids:
            debts_ref = db.collection("groups").document(
                group_id).collection("debts").where("paid", "==", False).stream()

            for d in debts_ref:
                debt = d.to_dict()
                if not debt:
                    continue

                # 檢查是否為分期且使用者為付款者
                installment = debt.get("installment")
                if installment and int(installment) > 0:
                    payer_list = debt.get("payer", [])
                    for p in payer_list:
                        if p.get("uid") == uid and not p.get("paid", False):
                            result.append({
                                **debt,
                                "group_id": group_id,
                                "debt_id": d.id
                            })
                            break

        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error in get_installment_debts: {str(e)}")
        return jsonify({"error": str(e)}), 500


# 🔹 優化：只查詢有到期日的債務
@bp.route("/due/<uid>", methods=["GET"])
def get_due_debts(uid):
    try:
        result = []

        # 先找出使用者所屬的群組
        groups_ref = db.collection("groups").stream()
        group_ids = []

        for g in groups_ref:
            group_data = g.to_dict()
            members = group_data.get("members", [])
            if any(m.get("uid") == uid for m in members):
                group_ids.append(g.id)

        # 只查詢這些群組中未付清的債務
        for group_id in group_ids:
            debts_ref = db.collection("groups").document(
                group_id).collection("debts").where("paid", "==", False).stream()

            for d in debts_ref:
                debt = d.to_dict()
                if not debt or not debt.get("due_date"):
                    continue

                payer_list = debt.get("payer", [])
                for p in payer_list:
                    if p.get("uid") == uid and not p.get("paid", False):
                        result.append({
                            **debt,
                            "group_id": group_id,
                            "debt_id": d.id
                        })
                        break

        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error in get_due_debts: {str(e)}")
        return jsonify({"error": str(e)}), 500
