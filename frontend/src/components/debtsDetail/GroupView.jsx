//frontend/components/debtsDetail//GroupView.jsx
import React, { useEffect, useState } from "react";
import DebtForm from "./DebtForm";
import TopToolsBar from "../tools/TopToolsBar";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DebtList from "./DebtList";

export default function GroupView() {
  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const { id } = useParams(); // id 對應路由的 :id
  const groupId = id;

  // 取得使用者資訊
  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  // 取得群組資訊（包含成員）
  useEffect(() => {
    if (!groupId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        setGroupMembers(data.members || []);
      })
      .catch(console.error);
  }, [groupId]);

  // 取得債務資料
  useEffect(() => {
    if (!groupId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/debts/${groupId}`)
      .then((res) => res.json())
      .then((data) =>
        setDebts(
          data.map((d) => ({
            ...d,
            groupId,
            checked: false,
            installment: d.installment || null,
            current: d.current || null,
            note: d.note || "",
          }))
        )
      )
      .catch(console.error);
  }, [groupId]);

  const handleAddedDebt = (newDebt) => {
    setDebts([
      ...debts,
      {
        ...newDebt,
        groupId,
        checked: false,
        installment: newDebt.installment || null,
        current: newDebt.current || null,
        note: newDebt.note || "",
        createdAt: newDebt.createdAt || null,
      },
    ]);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 font-sans text-zinc-100">
      <TopToolsBar />

      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">債務紀錄</h2>
          {groupMembers.map((m) => (
            <Avatar key={m.uid} className="w-8 h-8">
              <AvatarImage src={m.photoUrl} alt={m.displayName} />
              <AvatarFallback>{m.displayName[0]}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        <Button onClick={() => setShowForm(!showForm)}>新增債務</Button>

        {/* 債務表單 */}
        {showForm && user && (
          <DebtForm
            groupId={groupId}
            onAdded={handleAddedDebt}
            members={groupMembers}
            currentUser={user}
          />
        )}

        {/* 債務清單 */}
        <DebtList
          debts={debts}
          onDelete={(id) => {
            fetch(
              `${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${id}`,
              {
                method: "DELETE",
              }
            ).then(() => setDebts(debts.filter((d) => d.id !== id)));
          }}
          onEdit={(updated) => {
            // ✅ 更新陣列中的那筆資料
            setDebts((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
          }}
          onMarkPaid={(id) => {
            fetch(
              `${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paid: true }),
              }
            )
              .then((res) => res.json())
              .then((updated) => {
                setDebts((prev) =>
                  prev.map((d) => (d.id === id ? updated : d))
                );
              })
              .catch(console.error);
          }}
        />
      </div>
    </div>
  );
}
