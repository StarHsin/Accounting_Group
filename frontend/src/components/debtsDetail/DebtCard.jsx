// frontend/components/debtsDetail/DebtCard.jsx
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
    const diff = debt._touchStartX - endX;

    if (diff > 50) {
      // 向左滑動超過 50px
      onSwipe(debt.id);
    } else if (diff < -50) {
      // 向右滑動超過 50px
      onSwipe(null);
    } else {
      // 輕微滑動或點擊，保持現狀
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onDelete) onDelete(debt.id);
  };

  // 決定文字顏色
  const textColor = debt.paid ? "text-zinc-500" : "text-white";
  const amountColor = debt.paid ? "text-zinc-500" : "text-green-400";
  const installmentColor = debt.paid ? "text-zinc-600" : "text-zinc-400";

  return (
    <div className="relative">
      <Card
        className={`
          bg-zinc-800 rounded-2xl shadow-xl p-4 flex justify-between items-center transition-transform duration-300 ease-out 
          ${debt.paid ? "opacity-70 pointer-events-none" : "hover:shadow-2xl"}
          ${swipedId === debt.id ? "-translate-x-36" : "translate-x-0"}
          border border-zinc-700
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {/* 左側：收款人 + 備註 + 時間 + 分期狀態 */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Avatar className="w-12 h-12 border-2 border-zinc-700">
            <AvatarImage
              src={debt.receiver?.photoUrl}
              alt={debt.receiver?.displayName}
            />
            <AvatarFallback className="bg-zinc-700 text-lg">
              {debt.receiver?.displayName ? debt.receiver.displayName[0] : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col truncate">
            <span className={`font-semibold text-base ${textColor} truncate`}>
              {debt.note || "未命名"}
            </span>
            {debt.createdAt && (
              <span className={`text-xs ${installmentColor} mt-0.5`}>
                {debt.createdAt._seconds
                  ? new Date(debt.createdAt._seconds * 1000).toLocaleDateString(
                      "zh-TW"
                    )
                  : new Date(debt.createdAt).toLocaleDateString("zh-TW")}
              </span>
            )}
            {debt.installment ? (
              <span className={`text-sm ${installmentColor} font-medium mt-1`}>
                {debt.current
                  ? `第 ${debt.current} / ${debt.installment} 期`
                  : `${debt.installment} 期 (未開始)`}
              </span>
            ) : (
              <span className={`text-sm ${installmentColor} mt-1`}>
                一次付清
              </span>
            )}
          </div>
        </div>

        {/* 右側：金額 + 分攤人頭像 */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <span className={`text-xl font-extrabold ${amountColor}`}>
            NT${debt.amount}
          </span>
          <div className="flex -space-x-1.5 justify-end">
            {Array.isArray(debt.payer) &&
              debt.payer.map((p) => (
                <Avatar key={p.uid} className="w-7 h-7 border border-zinc-700">
                  <AvatarImage src={p.photoUrl} alt={p.displayName} />
                  <AvatarFallback className="text-xs bg-zinc-600">
                    {p.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
          </div>
        </div>
      </Card>

      {/* 滑出來的操作按鈕 - 優化樣式 */}
      {swipedId === debt.id && !debt.paid && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
          <Button
            size="icon" // 使用 icon size 讓按鈕變小
            className="w-16 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
            onClick={() => onEdit(debt)}
          >
            編輯
          </Button>
          <Button
            size="icon"
            className="w-16 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
            onClick={() => onMarkPaid(debt.id)}
          >
            已付
          </Button>
        </div>
      )}
    </div>
  );
}
