// frontend/components/debtsDetail/ConfirmDialog.jsx
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * 通用確認對話框
 *
 * @param {boolean} open - 是否開啟對話框
 * @param {function} onCancel - 點擊取消時的回呼
 * @param {function} onConfirm - 點擊確認時的回呼
 * @param {string} title - 對話框標題
 * @param {string|ReactNode} description - 對話框說明文字，可包含自訂名稱或提示
 * @param {string} confirmText - 確認按鈕文字（例如「確定刪除」、「確認已付」）
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmText = "確認",
}) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
