//frontend/components/DebtForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function DebtForm({ groupId, onAdded, members, currentUser }) {
  const [payerList, setPayerList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [installment, setInstallment] = useState("");
  const [current, setCurrent] = useState("");

  const dropdownRef = useRef(null); // 1️⃣ 建立 ref

  const payerOptions = members.filter((m) => m.uid !== currentUser.uid);

  const togglePayer = (uid) => {
    setPayerList((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleAll = () => {
    if (payerList.length === payerOptions.length) {
      setPayerList([]);
    } else {
      setPayerList(payerOptions.map((m) => m.uid));
    }
  };

  // 2️⃣ 監聽點擊空白關閉 dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/debts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          payer: payerList,
          receiver: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoUrl: currentUser.photoURL,
          },
          amount: parseFloat(amount),
          note,
          installment: installment ? parseInt(installment) : null,
          current: current ? parseInt(current) : null,
        }),
      });

      if (!res.ok) {
        console.error("HTTP error", res.status, await res.text());
        throw new Error("HTTP error " + res.status);
      }

      const data = await res.json();
      onAdded(data);
    } catch (err) {
      console.error("新增債務失敗:", err);
      alert("新增債務失敗，請確認後端是否啟動");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 mb-4 p-4 bg-zinc-800 rounded-lg"
    >
      {/* 下拉多選 */}
      <div className="relative" ref={dropdownRef}>
        {" "}
        {/* 3️⃣ 加上 ref */}
        <div
          className="bg-zinc-900 text-white p-2 rounded-lg cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {payerList.length === 0
            ? "選擇付款者"
            : payerOptions
                .filter((m) => payerList.includes(m.uid))
                .map((m) => m.displayName)
                .join(", ")}
        </div>
        {dropdownOpen && (
          <div className="absolute mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg z-10 max-h-60 overflow-auto">
            <label className="flex items-center gap-2 p-2 border-b border-zinc-700 cursor-pointer">
              <Checkbox
                checked={payerList.length === payerOptions.length}
                onCheckedChange={toggleAll}
                className="border border-zinc-200"
              />
              <span className="text-white">全選</span>
            </label>

            {payerOptions.map((m) => (
              <label
                key={m.uid}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-zinc-800"
              >
                <Checkbox
                  checked={payerList.includes(m.uid)}
                  onCheckedChange={() => togglePayer(m.uid)}
                  className="border border-zinc-200"
                />
                <span className="text-white">{m.displayName}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="金額"
        className="bg-zinc-900 text-white"
      />
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="備註"
        className="bg-zinc-900 text-white"
      />
      <Input
        type="number"
        value={installment}
        onChange={(e) => setInstallment(e.target.value)}
        placeholder="總期數"
        className="bg-zinc-900 text-white"
      />
      <Input
        type="number"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="目前期數"
        className="bg-zinc-900 text-white"
      />
      <Button type="submit">新增</Button>
    </form>
  );
}
