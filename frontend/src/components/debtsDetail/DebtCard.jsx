"use client";

// frontend/components/debtsDetail/DebtCard.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, CheckCircle2, CreditCard } from "lucide-react";

export default function DebtCard({
  debt,
  swipedId,
  onSwipe,
  onDelete,
  onEdit,
  onMarkPaid,
}) {
  const handleTouchStart = (e) => {
    debt._touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = debt._touchStartX - endX;

    if (!debt.paid) {
      if (diff > 50) {
        onSwipe(debt.id);
      } else if (diff < -50) {
        onSwipe(null);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onDelete) onDelete(debt.id);
  };

  const isPaid = debt.paid;
  const cardBg = isPaid
    ? "bg-zinc-800/50 border-zinc-700/50"
    : "bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 hover:border-emerald-500/50";
  const textColor = isPaid ? "text-zinc-500" : "text-white";
  const amountColor = isPaid ? "text-zinc-500" : "text-emerald-400";
  const installmentColor = isPaid ? "text-zinc-600" : "text-zinc-400";

  return (
    <div className="relative group">
      <Card
        className={`
          ${cardBg} rounded-2xl shadow-xl p-5 flex justify-between items-center transition-all duration-300 ease-out 
          ${isPaid ? "opacity-60" : "hover:shadow-2xl hover:scale-[1.02]"}
          ${swipedId === debt.id ? "-translate-x-40" : "translate-x-0"}
          border-2 relative overflow-hidden
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {!isPaid && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}

        {isPaid && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-zinc-700 text-zinc-400 border-zinc-600 flex items-center gap-1 px-3 py-1">
              <CheckCircle2 className="w-3 h-3" />
              已付款
            </Badge>
          </div>
        )}

        {/* 左側：收款人 + 備註 + 時間 + 分期狀態 */}
        <div className="flex items-start gap-4 flex-1 min-w-0 relative z-10">
          <div className="relative">
            <Avatar
              className={`w-14 h-14 border-2 ${
                isPaid ? "border-zinc-700" : "border-emerald-500/50"
              } shadow-lg ring-2 ring-zinc-900/50`}
            >
              <AvatarImage
                src={debt.receiver?.photoUrl || "/placeholder.svg"}
                alt={debt.receiver?.displayName}
              />
              <AvatarFallback className="bg-zinc-700 text-white text-lg font-semibold">
                {debt.receiver?.displayName
                  ? debt.receiver.displayName[0]
                  : "?"}
              </AvatarFallback>
            </Avatar>
            {!isPaid && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CreditCard className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 truncate">
            <span className={`font-bold text-lg ${textColor} truncate`}>
              {debt.note || "未命名"}
            </span>
            {debt.createdAt && (
              <div
                className={`flex items-center gap-1.5 text-xs ${installmentColor}`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {debt.createdAt._seconds
                    ? new Date(
                        debt.createdAt._seconds * 1000
                      ).toLocaleDateString("zh-TW")
                    : new Date(debt.createdAt).toLocaleDateString("zh-TW")}
                </span>
              </div>
            )}
            {debt.installment ? (
              <Badge
                variant="outline"
                className={`w-fit text-xs ${
                  isPaid
                    ? "border-zinc-700 text-zinc-600"
                    : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                } font-medium mt-1`}
              >
                {debt.current
                  ? `第 ${debt.current} / ${debt.installment} 期`
                  : `${debt.installment} 期 (未開始)`}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={`w-fit text-xs ${
                  isPaid
                    ? "border-zinc-700 text-zinc-600"
                    : "border-zinc-600 text-zinc-400"
                } mt-1`}
              >
                一次付清
              </Badge>
            )}
          </div>
        </div>

        {/* 右側：金額 + 分攤人頭像 */}
        <div className="flex flex-col items-end gap-3 ml-4 relative z-10">
          <div
            className={`px-4 py-2 rounded-xl ${
              isPaid
                ? "bg-zinc-700/50"
                : "bg-emerald-500/10 border border-emerald-500/30"
            }`}
          >
            <span
              className={`text-2xl font-extrabold font-mono ${amountColor}`}
            >
              NT${debt.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex -space-x-2 justify-end">
            {Array.isArray(debt.payer) &&
              debt.payer.map((p, idx) => (
                <Avatar
                  key={p.uid}
                  className={`w-8 h-8 border-2 ${
                    isPaid ? "border-zinc-700" : "border-zinc-900"
                  } shadow-md transition-transform hover:scale-110 hover:z-10`}
                  style={{ zIndex: debt.payer.length - idx }}
                >
                  <AvatarImage
                    src={p.photoUrl || "/placeholder.svg"}
                    alt={p.displayName}
                  />
                  <AvatarFallback className="text-xs bg-zinc-700 text-white font-semibold">
                    {p.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
          </div>
        </div>
      </Card>

      {swipedId === debt.id && !debt.paid && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2 pr-2">
          <Button
            size="icon"
            className="w-16 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg border-2 border-blue-400/50 transition-all hover:scale-105"
            onClick={() => onEdit(debt)}
          >
            <Edit className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="w-16 h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg border-2 border-emerald-400/50 transition-all hover:scale-105"
            onClick={() => onMarkPaid(debt.id)}
          >
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
