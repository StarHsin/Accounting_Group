"use client";

//frontend/components/debtsDetail/DebtList.jsx
import { useState } from "react";
import DebtCard from "./DebtCard";
import EditDebtDialog from "./EditDebtDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function DebtList({ debts, onDelete, onEdit, onMarkPaid }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [swipedId, setSwipedId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    note: "",
    installment: "",
    current: "",
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
            });
          }}
          onMarkPaid={onMarkPaid}
        />
      ))}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (onDelete) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />

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
