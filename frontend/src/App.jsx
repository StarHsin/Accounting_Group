// frontend/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import CallbackPage from "./components/Callback";
import GroupView from "./components/debtsDetail/GroupView";
import Homepage from "./components/Homepage/Homepage";
import InstallmentDebtsPage from "./components/InstallmentDebtsPage";
import DueDebtsPage from "./components/DueDebtsPage";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/Homepage" element={<Homepage />} />
          <Route path="/groups/:id" element={<GroupView />} />
          <Route
            path="/debts/installments"
            element={<InstallmentDebtsPage />}
          />
          <Route path="/debts/due" element={<DueDebtsPage />} />
        </Routes>
      </Router>
    </>
  );
}
