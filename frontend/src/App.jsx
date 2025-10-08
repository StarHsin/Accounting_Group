// frontend/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/Login";
import CallbackPage from "./components/Callback";
import GroupView from "./components/debtsDetail/GroupView";
import Homepage from "./components/Homepage/Homepage";
import InstallmentDebtsPage from "./components/InstallmentDebtsPage";
import DueDebtsPage from "./components/DueDebtsPage";
import { Toaster } from "sonner";

// PWA 啟動時強制導向根路徑的 wrapper
function AppContent() {
  const location = useLocation();

  // 如果是 PWA 啟動且不在根路徑，導向根路徑檢查登入
  useEffect(() => {
    if (location.pathname !== "/" && !window.location.search.includes("code")) {
      // 檢查是否為 PWA 環境
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone
      ) {
        window.location.replace("/");
      }
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/Homepage" element={<Homepage />} />
      <Route path="/groups/:id" element={<GroupView />} />
      <Route path="/debts/installments" element={<InstallmentDebtsPage />} />
      <Route path="/debts/due" element={<DueDebtsPage />} />
      <Route path="*" element={<LoginPage />} /> {/* 捕捉無效路徑 */}
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <Toaster />
      <Router>
        <AppContent />
      </Router>
    </>
  );
}
