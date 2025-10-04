"use client";

// frontend/components/debtsDetail/GroupView.jsx
import { useEffect, useState, useMemo } from "react";
import DebtForm from "./DebtForm";
import TopToolsBar from "../tools/TopToolsBar";
import { useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";
import { Button } from "@/components/ui/button";
import DebtStats from "./DebtStats";
import GroupMembers from "./GroupMembers";
import DebtSection from "./DebtSection";
import { Plus, X } from "lucide-react";

export default function GroupView() {
  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const { id } = useParams();
  const groupId = id;

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 取得群組資訊
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
    setDebts((prev) => [
      ...prev,
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

  // 篩選邏輯
  const filteredDebts = useMemo(() => {
    if (!user || !showOnlyMine) return debts;
    return debts.filter(
      (d) =>
        d.receiver?.uid === user.uid ||
        (Array.isArray(d.payer) && d.payer.some((p) => p.uid === user.uid))
    );
  }, [debts, user, showOnlyMine]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 font-sans text-zinc-100 pb-20">
      <TopToolsBar title={groupName} />
      <div className="p-4 flex flex-col gap-6">
        <GroupMembers members={groupMembers} />
        <DebtStats debts={debts} members={groupMembers} currentUser={user} />

        {user && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`w-full font-semibold rounded-xl shadow-lg transition-all h-12 flex items-center justify-center gap-2 ${
              showForm
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            }`}
          >
            {showForm ? (
              <>
                <X className="w-5 h-5" />
                關閉新增表單
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                新增債務
              </>
            )}
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

        <DebtSection
          debts={filteredDebts}
          groupId={groupId}
          showOnlyMine={showOnlyMine}
          setShowOnlyMine={setShowOnlyMine}
          setDebts={setDebts}
        />
      </div>
    </div>
  );
}
