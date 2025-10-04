"use client";

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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Calendar, Save, X } from "lucide-react";

export default function EditDebtDialog({
  open,
  onClose,
  form,
  setForm,
  onSave,
}) {
  const dialogInputClass =
    "bg-zinc-800 border-2 border-zinc-700 focus:border-emerald-500 transition-all rounded-xl mt-2 h-11 pl-11 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 text-white rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            編輯債務
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            修改金額、備註、分期資料
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300 font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              金額
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={dialogInputClass}
                placeholder="輸入金額"
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
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className={dialogInputClass}
                placeholder="輸入備註"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-semibold flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                分期
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  type="number"
                  value={form.installment}
                  onChange={(e) =>
                    setForm({ ...form, installment: e.target.value })
                  }
                  className={dialogInputClass}
                  placeholder="總期數"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-semibold flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-emerald-400" />
                當前期數
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  type="number"
                  value={form.current}
                  onChange={(e) =>
                    setForm({ ...form, current: e.target.value })
                  }
                  className={dialogInputClass}
                  placeholder="目前期數"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            取消
          </Button>
          <Button
            onClick={onSave}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
