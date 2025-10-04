"use client";

//frontend/components/debtsDetail/DebtForm.jsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, FileText, Calendar, Plus } from "lucide-react";

export default function DebtForm({ groupId, onAdded, members, currentUser }) {
  const [payerList, setPayerList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [installment, setInstallment] = useState("");
  const [current, setCurrent] = useState("");

  const dropdownRef = useRef(null);

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
          amount: Number.parseFloat(amount),
          note,
          installment: installment ? Number.parseInt(installment) : null,
          current: current ? Number.parseInt(current) : null,
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
      alert("新增債務失敗,請確認後端是否啟動");
    }
  };

  const commonInputClass =
    "bg-zinc-800 text-white placeholder:text-zinc-500 border-2 border-zinc-700 focus:border-emerald-500 transition-all rounded-xl h-12 pl-11 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl shadow-2xl border-2 border-zinc-700 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-zinc-300 font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            付款者
          </Label>
          <div className="relative" ref={dropdownRef}>
            <div
              className={`
                bg-zinc-800 text-white border-2 border-zinc-700 focus:border-emerald-500 transition-all rounded-xl h-12
                flex items-center px-4 cursor-pointer hover:border-emerald-500/50
                ${
                  dropdownOpen
                    ? "rounded-b-none border-b-0 border-emerald-500"
                    : ""
                }
              `}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Users className="w-5 h-5 text-zinc-500 mr-3" />
              <span
                className={
                  payerList.length === 0
                    ? "text-zinc-500"
                    : "text-white font-medium"
                }
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
              <div className="absolute mt-0 w-full bg-zinc-800 border-2 border-emerald-500 border-t-0 rounded-b-xl z-20 max-h-60 overflow-auto shadow-2xl">
                <label className="flex items-center gap-3 p-4 border-b border-zinc-700 cursor-pointer bg-zinc-700/50 hover:bg-zinc-700 transition-colors">
                  <Checkbox
                    checked={payerList.length === payerOptions.length}
                    onCheckedChange={toggleAll}
                    className="border-2 border-zinc-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <span className="text-white font-semibold">全選</span>
                </label>

                {payerOptions.map((m) => (
                  <label
                    key={m.uid}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-700/50 transition-colors border-b border-zinc-700/50 last:border-0"
                  >
                    <Checkbox
                      checked={payerList.includes(m.uid)}
                      onCheckedChange={() => togglePayer(m.uid)}
                      className="border-2 border-zinc-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <span className="text-white">{m.displayName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            金額
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="輸入金額"
              className={commonInputClass}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            備註
          </Label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="輸入備註說明"
              className={commonInputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-zinc-300 font-semibold flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-400" />
              總期數
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="number"
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
                placeholder="總期數"
                className={commonInputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300 font-semibold flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-400" />
              目前期數
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="目前期數"
                className={commonInputClass}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="mt-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl h-12 shadow-lg transition-all hover:scale-[1.02] hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增債務
        </Button>
      </div>
    </form>
  );
}
