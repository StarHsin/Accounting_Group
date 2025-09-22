# 群組記帳系統 (MVP)

這是一個用於朋友或群組的簡單記帳系統，適合旅行、聚餐或合租等場景。  
支援 **LINE 登入**、**群組管理**、**債務記錄與顯示**，採用 **React + Vite (前端)**、**Flask (後端)** 與 **Firebase**。

---

## 🚀 功能

- LINE OAuth 登入
- 群組建立 / 成員管理
- 債務新增 / 編輯 / 刪除
- 即時同步 Firebase Firestore

---

## 📂 專案結構

project-root/
├─ frontend/ # React + Vite 前端
├─ backend/ # Flask 後端
├─ .gitignore
├─ README.md

---

## ⚙️ 環境需求

- Node.js (建議 18+)
- Python 3.10+
- Firebase 專案與 Service Account
- LINE Login Channel (取得 client id/secret)

---

## 🔑 設定

### 1. Firebase 金鑰

- 到 Firebase Console → 建立 Service Account 金鑰
- 下載 `serviceAccountKey.json` → 放在 `backend/`
- ⚠️ 加到 `.gitignore` 避免上傳：
  backend/serviceAccountKey.json
  .env

### 2. `.env` 設定

在 `backend/.env` 中放：

LINE_CLIENT_ID=你的\_LINE_ClientID
LINE_CLIENT_SECRET=你的\_LINE_ClientSecret
LINE_REDIRECT_URI=https://你的前端網址/callback

如果要雲端部署，可以把 `serviceAccountKey.json` 轉成環境變數：

```bash
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "..."
}'
```
