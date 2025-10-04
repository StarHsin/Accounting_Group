"use client";

// frontend/components/debtsDetail/DebtStats.jsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  User,
  Wallet,
  DollarSign,
} from "lucide-react";

export default function DebtStats({ debts = [], members = [], currentUser }) {
  const [stats, setStats] = useState(null);

  // 從後端載入統計資料
  useEffect(() => {
    if (!debts.length) return;
    const groupId = debts[0].groupId;
    fetch(`${import.meta.env.VITE_API_URL}/api/debts/stats/${groupId}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, [debts]);

  if (!stats) return null;

  // 找成員資料
  const findMember = (uid) => members.find((m) => m.uid === uid);
  const biggestDebtor = findMember(stats.biggestDebtorId);
  const biggestCreditor = findMember(stats.biggestCreditorId);

  // 計算自己的金額
  const myDebt = stats.debtByMember[currentUser?.uid] || 0;
  const myReceive = stats.receiveByMember[currentUser?.uid] || 0;

  const CenterMemberAvatar = ({ member, role, amount }) => {
    if (!member)
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-700">
          <User className="w-16 h-16 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500">暫無資料</p>
        </div>
      );
    const isCreditor = role === "債主";
    const bgGradient = isCreditor
      ? "from-emerald-500/20 to-green-500/20"
      : "from-rose-500/20 to-red-500/20";
    const borderColor = isCreditor ? "border-emerald-500" : "border-rose-500";
    const badgeColor = isCreditor
      ? "bg-gradient-to-r from-emerald-500 to-green-500"
      : "bg-gradient-to-r from-rose-500 to-red-500";

    return (
      <div
        className={`flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br ${bgGradient} border-2 ${borderColor} backdrop-blur-sm transition-all hover:scale-105`}
      >
        <div className="relative">
          <Avatar
            className={`w-20 h-20 sm:w-24 sm:h-24 border-4 ${borderColor} shadow-2xl ring-4 ring-zinc-900/50`}
          >
            <AvatarImage
              src={member.photoUrl || "/placeholder.svg"}
              alt={member.displayName}
            />
            <AvatarFallback className="bg-zinc-700 text-white text-2xl font-bold">
              {member.displayName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full ${badgeColor} flex items-center justify-center shadow-lg`}
          >
            {isCreditor ? (
              <TrendingUp className="w-5 h-5 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
        <p className="mt-4 text-white font-bold text-lg text-center">
          {member.displayName}
        </p>
        <Badge
          className={`mt-2 text-sm font-bold ${badgeColor} border-0 shadow-lg px-4 py-1`}
        >
          最大{role}
        </Badge>
        <div className="mt-3 px-4 py-2 bg-zinc-900/50 rounded-lg backdrop-blur-sm">
          <p className="text-base text-zinc-300 font-mono font-semibold">
            NT${(amount || 0).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border-zinc-700 p-6 text-white rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-700/50">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              群組未結總覽
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group p-5 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-2xl border border-rose-500/30 backdrop-blur-sm hover:border-rose-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-rose-400 font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> 總欠債
                </p>
                <div className="p-2 bg-rose-500/20 rounded-lg group-hover:bg-rose-500/30 transition-colors">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <p className="text-3xl font-mono font-bold text-rose-300">
                NT${stats.totalDebt.toLocaleString()}
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/30 backdrop-blur-sm hover:border-emerald-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 總收款
                </p>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-mono font-bold text-emerald-300">
                NT${stats.totalReceive.toLocaleString()}
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm hover:border-red-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-red-400 font-semibold">我的應付</p>
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                  <User className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-mono font-bold text-red-300">
                NT${myDebt.toLocaleString()}
              </p>
            </div>

            <div className="group p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30 backdrop-blur-sm hover:border-green-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-green-400 font-semibold">我的應收</p>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <User className="w-4 h-4 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-mono font-bold text-green-300">
                NT${myReceive.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          {/* 最大債主 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                最大債主
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">這位成員收回最多</p>
            <CenterMemberAvatar
              member={biggestCreditor}
              role="債主"
              amount={
                stats.biggestCreditorId
                  ? stats.receiveByMember[stats.biggestCreditorId]
                  : 0
              }
            />
          </div>

          {/* 最大負債者 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                最大負債者
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">這位成員欠款最多</p>
            <CenterMemberAvatar
              member={biggestDebtor}
              role="負債者"
              amount={
                stats.biggestDebtorId
                  ? stats.debtByMember[stats.biggestDebtorId]
                  : 0
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
