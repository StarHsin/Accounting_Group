// frontend/components/tools/Bottom_functionality_bar.jsx
import {
  IoHomeOutline,
  IoAdd,
  IoJournalOutline,
  IoHourglassOutline,
  IoMailOutline,
} from "react-icons/io5";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UnifiedModal from "./UnifiedModal";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomFunctionalityBar({ setGroups }) {
  const [openUnified, setOpenUnified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 新增：取得當前路由

  // ✅ 根據 pathname 決定哪個按鈕是 active
  const getActiveIndex = () => {
    if (location.pathname === "/Homepage") return 0;
    if (location.pathname === "/debts/installments") return 1;
    if (location.pathname === "/debts/due") return 3;
    return -1;
  };

  const activeIndex = getActiveIndex();

  const buttons = [
    {
      icon: <IoHomeOutline size={22} />,
      label: "主頁",
      onClick: () => navigate("/Homepage"),
    },
    {
      icon: <IoJournalOutline size={22} />,
      label: "分期",
      onClick: () => navigate("/debts/installments"),
    },
    {
      icon: <IoAdd size={28} />,
      label: "群組",
      onClick: () => setOpenUnified(true),
    },
    {
      icon: <IoHourglassOutline size={22} />,
      label: "即將到期",
      onClick: () => navigate("/debts/due"),
    },
    { icon: <IoMailOutline size={22} />, label: "最新動態" },
  ];

  return (
    <>
      <div className="grid w-full grid-cols-5 fixed bottom-0 left-0 justify-around items-center bg-zinc-900 text-zinc-50 py-2 shadow-lg">
        {buttons.map((btn, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-1"
            >
              <Button
                variant="ghost"
                className={`flex flex-col items-center justify-center text-xs h-auto py-1 px-2 ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-white/80"
                } bg-transparent hover:bg-transparent`}
                onClick={btn.onClick}
              >
                {btn.icon}
                <span className="mt-1">{btn.label}</span>
              </Button>
              <div
                className={`h-[3px] w-5 mt-1 rounded-full transition-opacity duration-300 ease-in-out ${
                  isActive ? "bg-white opacity-100" : "bg-transparent opacity-0"
                }`}
              ></div>
            </div>
          );
        })}
      </div>

      {openUnified && (
        <UnifiedModal setOpen={setOpenUnified} setGroups={setGroups} />
      )}
    </>
  );
}
