//frontend/components/debtsDetail/DebtForm.jsx
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

    const selectedPayers = members
      .filter((m) => payerList.includes(m.uid))
      .map((m) => ({
        uid: m.uid,
        displayName: m.displayName,
        photoUrl: m.photoUrl,
      }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/debts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          payer: selectedPayers,
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

  const commonInputClass =
    "bg-zinc-700 text-white placeholder:text-zinc-400 border-zinc-600 focus:border-green-500 transition-colors rounded-xl h-12";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mb-4 p-5 bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700"
    >
      {/* 下拉多選 - 優化樣式 */}
      <div className="relative" ref={dropdownRef}>
        {" "}
        {/* 3️⃣ 加上 ref */}
        <div
          className={`
            ${commonInputClass} 
            flex items-center p-3 cursor-pointer h-12
            ${dropdownOpen ? "rounded-b-none border-b-0" : ""}
          `}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span
            className={payerList.length === 0 ? "text-zinc-400" : "text-white"}
          >
            {payerList.length === 0
              ? "選擇付款者"
              : payerOptions
                  .filter((m) => payerList.includes(m.uid))
                  .map((m) => m.displayName)
                  .join(", ")}
          </span>
        </div>
        {dropdownOpen && (
          <div className="absolute mt-0 w-full bg-zinc-700 border border-zinc-600 rounded-b-xl z-10 max-h-60 overflow-auto shadow-xl">
            <label className="flex items-center gap-3 p-3 border-b border-zinc-600 cursor-pointer bg-zinc-600">
              {" "}
              {/* 全選行使用不同底色 */}
              <Checkbox
                checked={payerList.length === payerOptions.length}
                onCheckedChange={toggleAll}
                className="border-2 border-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
              />
              <span className="text-white font-semibold">全選</span>
            </label>

            {payerOptions.map((m) => (
              <label
                key={m.uid}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-600 transition-colors"
              >
                <Checkbox
                  checked={payerList.includes(m.uid)}
                  onCheckedChange={() => togglePayer(m.uid)}
                  className="border-2 border-zinc-400 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
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
        className={commonInputClass}
      />
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="備註"
        className={commonInputClass}
      />
      <div className="flex gap-2">
        <Input
          type="number"
          value={installment}
          onChange={(e) => setInstallment(e.target.value)}
          placeholder="總期數"
          className={commonInputClass}
        />
        <Input
          type="number"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="目前期數"
          className={commonInputClass}
        />
      </div>
      <Button
        type="submit"
        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-12 shadow-lg"
      >
        新增
      </Button>
    </form>
  );
}
