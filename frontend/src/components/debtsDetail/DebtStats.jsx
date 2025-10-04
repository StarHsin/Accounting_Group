import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, User } from "lucide-react";

export default function DebtStats({ debts = [], members = [], currentUser }) {
  const [stats, setStats] = useState(null);

  // 從後端載入統計資料
  useEffect(() => {
    if (!debts.length) return;
    const groupId = debts[0].groupId;
    fetch(`http://localhost:5000/api/debts/stats/${groupId}`)
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

  // 共用成員頭像元件
  const CenterMemberAvatar = ({ member, role, amount }) => {
    if (!member) return <User className="w-12 h-12 text-zinc-500" />;
    const isCreditor = role === "債主";
    const colorClass = isCreditor ? "border-green-500" : "border-red-500";
    return (
      <div className="flex flex-col items-center">
        <Avatar
          className={`w-15 h-15 border-4 ${colorClass} shadow-lg ring-4 ring-zinc-900`}
        >
          <AvatarImage src={member.photoUrl} alt={member.displayName} />
          <AvatarFallback className="bg-zinc-600 text-white text-lg">
            {member.displayName?.[0]}
          </AvatarFallback>
        </Avatar>
        <p className="mt-2 text-white font-bold text-sm">
          {member.displayName}
        </p>
        <Badge
          className={`mt-1 text-xs font-bold ${
            isCreditor ? "bg-green-600" : "bg-red-600"
          }`}
        >
          最大{role}
        </Badge>
        <p className="text-sm text-zinc-300 mt-1">
          金額: NT${(amount || 0).toFixed(0)}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 💰群組未結總覽 */}
      <Card className="bg-gradient-to-br from-zinc-700 to-zinc-900 border-zinc-600 p-6 text-white rounded-2xl shadow-2xl col-span-1 md:col-span-2">
        <h2 className="text-2xl font-extrabold mb-4 text-center border-b border-zinc-600 pb-2 text-yellow-400">
          💰 群組未結總覽
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
            <p className="text-sm text-red-400 font-medium flex items-center justify-center">
              <TrendingDown className="w-4 h-4 mr-1" /> 總欠債
            </p>
            <p className="text-2xl font-mono mt-1 text-red-300">
              NT${stats.totalDebt.toFixed(0)}
            </p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
            <p className="text-sm text-green-400 font-medium flex items-center justify-center">
              <TrendingUp className="w-4 h-4 mr-1" /> 總收款
            </p>
            <p className="text-2xl font-mono mt-1 text-green-300">
              NT${stats.totalReceive.toFixed(0)}
            </p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
            <p className="text-sm text-red-500 font-medium">我的應付</p>
            <p className="text-xl font-mono mt-1 text-red-400">
              NT${myDebt.toFixed(0)}
            </p>
          </div>
          <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
            <p className="text-sm text-green-500 font-medium">我的應收</p>
            <p className="text-xl font-mono mt-1 text-green-400">
              NT${myReceive.toFixed(0)}
            </p>
          </div>
        </div>
      </Card>

      {/* 🧍最大債主與負債者區塊（並排） */}
      <Card className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-2 gap-6 items-start">
          {/* 最大債主 */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-green-400 mb-1">最大債主</h3>
            <p className="text-sm text-zinc-400 mb-3">這位成員收回最多</p>
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
            <h3 className="text-lg font-bold text-red-400 mb-1">最大負債者</h3>
            <p className="text-sm text-zinc-400 mb-3">這位成員欠款最多</p>
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
