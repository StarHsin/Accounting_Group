// frontend/components/debtsDetail/GroupView.jsx
import React, { useEffect, useState } from "react";
import DebtForm from "./DebtForm";
import TopToolsBar from "../tools/TopToolsBar";
import { useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DebtList from "./DebtList";

export default function GroupView() {
  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState(""); // ✅ 群組名
  const { id } = useParams();
  const groupId = id;

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 取得群組資訊（包含成員 & 群組名）
  useEffect(() => {
    if (!groupId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        setGroupMembers(data.members || []);
        setGroupName(data.name || "群組");
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
    <div className="flex flex-col min-h-screen bg-zinc-900 font-sans text-zinc-100 pb-20">
      {" "}
      {/* 增加底部邊距避免被導航欄遮擋 */}
      {/* ✅ 顯示群組名 */}
      <TopToolsBar title={groupName} />
      <div className="p-4 flex flex-col gap-5">
        {" "}
        {/* 增加間距 */}
        {/* 優化：群組成員顯示 */}
        <div className="flex items-center gap-4 p-3 bg-zinc-800 rounded-xl shadow-lg">
          <h2 className="text-lg font-bold text-zinc-300">成員</h2>
          <div className="flex -space-x-3">
            {" "}
            {/* 使用負邊距疊加頭像 */}
            {groupMembers.map((m) => (
              <Avatar
                key={m.uid}
                className="w-10 h-10 border-2 border-zinc-900 shadow-md"
              >
                {" "}
                {/* 增加邊框和尺寸 */}
                <AvatarImage src={m.photoUrl} alt={m.displayName} />
                <AvatarFallback className="bg-zinc-700 text-sm">
                  {m.displayName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        {user && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {showForm ? "關閉新增表單" : "新增債務"}
          </Button>
        )}
        {showForm && user && (
          <DebtForm
            groupId={groupId}
            onAdded={handleAddedDebt}
            members={groupMembers}
            currentUser={user}
          />
        )}
        {/* 債務清單標題 */}
        <h2 className="text-xl font-bold text-zinc-100 mt-2">債務列表</h2>
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
