"use client";

// frontend/components/debtsDetail/DebtList.jsx
import { useState } from "react";
import DebtCard from "./DebtCard";
import EditDebtDialog from "./EditDebtDialog";
import ConfirmDialog from "./ConfirmDialog";

export default function DebtList({ debts, groupId, onDelete, onEdit }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [swipedId, setSwipedId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [singlePayTarget, setSinglePayTarget] = useState(null);
  const [allPayTarget, setAllPayTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    note: "",
    installment: "",
    current: "",
    due_date: null,
  });

  const handleEditSave = () => {
    if (!editTarget) return;
    fetch(
      `${import.meta.env.VITE_API_URL}/api/debts/${editTarget.groupId}/${
        editTarget.id
      }`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      }
    )
      .then((res) => res.json())
      .then((updated) => {
        if (onEdit) onEdit(updated);
        setEditTarget(null);
      })
      .catch(console.error);
  };

  const handleMarkSinglePaid = (debtId, payerUid, payerName) => {
    setSinglePayTarget({ debtId, payerUid, payerName });
  };

  const confirmSinglePay = () => {
    if (!singlePayTarget) return;
    fetch(
      `${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${
        singlePayTarget.debtId
      }`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markPayerPaid: singlePayTarget.payerUid }),
      }
    )
      .then((res) => res.json())
      .then((updated) => {
        onEdit(updated);
        setSinglePayTarget(null);
      })
      .catch(console.error);
  };

  const handleMarkAllPaid = (debtId) => {
    setAllPayTarget(debtId);
  };

  const confirmAllPay = () => {
    if (!allPayTarget) return;
    fetch(
      `${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${allPayTarget}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllPaid: true }),
      }
    )
      .then((res) => res.json())
      .then((updated) => {
        onEdit(updated);
        setAllPayTarget(null);
      })
      .catch(console.error);
  };

  // ✅ 排序：未付款在前，已付款在後；同類再依建立時間排序
  const sortedDebts = [...debts].sort((a, b) => {
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1; // 未付款在前
    }
    const aTime = a.createdAt?._seconds
      ? a.createdAt._seconds * 1000
      : new Date(a.createdAt).getTime();
    const bTime = b.createdAt?._seconds
      ? b.createdAt._seconds * 1000
      : new Date(b.createdAt).getTime();
    return bTime - aTime; // 新的在上面
  });

  return (
    <div className="flex flex-col gap-4">
      {sortedDebts.map((d) => (
        <DebtCard
          key={d.id}
          debt={d}
          swipedId={swipedId}
          onSwipe={setSwipedId}
          onDelete={(id) => setDeleteTarget(id)}
          onEdit={(debt) => {
            setEditTarget(debt);
            setEditForm({
              amount: debt.amount,
              note: debt.note || "",
              installment: debt.installment || "",
              current: debt.current || "",
              due_date: debt.due_date || null,
            });
          }}
          onMarkPaid={handleMarkAllPaid}
          onMarkPayerPaid={handleMarkSinglePaid}
        />
      ))}

      {/* ✅ 通用刪除確認對話框 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (onDelete) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        title="確定要刪除嗎？"
        description="這個動作無法復原，刪除後全組資料將永久消失。"
        confirmText="確定刪除"
      />

      {/* ✅ 通用單人付款確認對話框 */}
      <ConfirmDialog
        open={!!singlePayTarget}
        onCancel={() => setSinglePayTarget(null)}
        onConfirm={confirmSinglePay}
        title="確認標示為已付？"
        description={`這將標示 ${
          singlePayTarget?.payerName || ""
        } 已支付他的份額。此動作無法輕易復原。`}
        confirmText="確認已付"
      />

      {/* ✅ 通用全部付款確認對話框 */}
      <ConfirmDialog
        open={!!allPayTarget}
        onCancel={() => setAllPayTarget(null)}
        onConfirm={confirmAllPay}
        title="確認將所有人標示為已付？"
        description="這將標示所有付款人已支付全部份額。此動作無法輕易復原。"
        confirmText="確認全部已付"
      />

      {/* ✅ 編輯債務對話框 */}
      <EditDebtDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditSave}
      />
    </div>
  );
}
