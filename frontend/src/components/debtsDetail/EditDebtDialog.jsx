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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯債務</DialogTitle>
          <DialogDescription>修改金額、備註、分期資料</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label>
            金額：
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            備註：
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
          <label>
            分期：
            <Input
              type="number"
              value={form.installment}
              onChange={(e) =>
                setForm({ ...form, installment: e.target.value })
              }
            />
          </label>
          <label>
            當前期數：
            <Input
              type="number"
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
            />
          </label>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={onSave}>儲存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
