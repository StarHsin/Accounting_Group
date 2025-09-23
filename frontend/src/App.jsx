// frontend/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import CallbackPage from "./components/Callback";
import GroupView from "./components/GroupView";
import GroupList from "./components/GroupList";
import Homepage from "./components/Homepage"; // 新增
import GroupDetail from "./components/GroupDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/Homepage" element={<Homepage />} /> {/* 🔑 新增 */}
        <Route path="/groups" element={<GroupList />} />
        <Route path="/groups/:id" element={<GroupView />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
      </Routes>
    </Router>
  );
}
