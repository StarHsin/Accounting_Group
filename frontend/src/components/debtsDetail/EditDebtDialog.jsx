//frontend/components/debtsDetail/EditDebtDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

export default function EditDebtDialog({
  open,
  onClose,
  form,
  setForm,
  onSave,
}) {
  // 統一的 Input 樣式
  const dialogInputClass =
    "bg-zinc-100 border-zinc-300 focus:border-green-500 transition-colors rounded-lg mt-1";

  return (
    // 使用 className 覆蓋 Shadcn DialogContent 的樣式，讓它適配暗色背景
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">編輯債務</DialogTitle>
          <DialogDescription className="text-zinc-400">
            修改金額、備註、分期資料
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-zinc-200">
            金額：
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={dialogInputClass}
            />
          </label>
          <label className="text-zinc-200">
            備註：
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={dialogInputClass}
            />
          </label>
          <label className="text-zinc-200">
            分期：
            <Input
              type="number"
              value={form.installment}
              onChange={(e) =>
                setForm({ ...form, installment: e.target.value })
              }
              className={dialogInputClass}
            />
          </label>
          <label className="text-zinc-200">
            當前期數：
            <Input
              type="number"
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
              className={dialogInputClass}
            />
          </label>
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-400 hover:bg-zinc-700 rounded-lg"
          >
            取消
          </Button>
          <Button
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
