//frontend/components/debtsDetail/DebtCard.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

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
    if (debt._touchStartX - endX > 50) {
      onSwipe(debt.id);
    } else {
      onSwipe(null);
    }
  };

  return (
    <div className="relative">
      <Card
        className={`bg-zinc-800 text-white rounded-lg shadow-md p-4 flex justify-between items-center transition-transform ${
          debt.paid ? "opacity-50 pointer-events-none" : ""
        } ${swipedId === debt.id ? "-translate-x-32" : "translate-x-0"}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          onDelete(debt.id);
        }}
      >
        {/* 左側：收款人 + 備註 + 時間 + 分期狀態 */}
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage
              src={debt.receiver?.photoUrl}
              alt={debt.receiver?.displayName}
            />
            <AvatarFallback>
              {debt.receiver?.displayName ? debt.receiver.displayName[0] : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold">{debt.note || "未命名"}</span>
            {debt.createdAt && (
              <span className="text-xs text-gray-400">
                {debt.createdAt._seconds
                  ? new Date(debt.createdAt._seconds * 1000).toLocaleString(
                      "zh-TW"
                    )
                  : new Date(debt.createdAt).toLocaleString("zh-TW")}
              </span>
            )}
            {debt.installment ? (
              <span className="text-sm text-gray-300">
                {debt.current}/{debt.installment}
              </span>
            ) : (
              <span className="text-sm text-gray-300">一次付清</span>
            )}
          </div>
        </div>

        {/* 右側：金額 + 分攤人頭像 */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-lg font-bold text-green-400">
            NT${debt.amount}
          </span>
          <div className="flex -space-x-2">
            {Array.isArray(debt.payer) &&
              debt.payer.map((p) => (
                <Avatar key={p.uid} className="w-6 h-6 border border-zinc-700">
                  <AvatarImage src={p.photoUrl} alt={p.displayName} />
                  <AvatarFallback>{p.displayName?.[0]}</AvatarFallback>
                </Avatar>
              ))}
          </div>
        </div>
      </Card>

      {/* 滑出來的操作按鈕 */}
      {swipedId === debt.id && !debt.paid && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(debt)}>
            編輯
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onMarkPaid(debt.id)}
          >
            已付
          </Button>
        </div>
      )}
    </div>
  );
}
