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

export default function BottomFunctionalityBar({ setGroups }) {
  const [openUnified, setOpenUnified] = useState(false);
  // 預設選中第一個按鈕
  const [activeIndex, setActiveIndex] = useState(0);

  const handleButtonClick = (index, callback) => {
    setActiveIndex(index);
    if (callback) callback();
  };

  const buttons = [
    { icon: <IoHomeOutline />, label: "主頁" },
    { icon: <IoJournalOutline />, label: "分期" },
    { icon: <IoAdd />, label: "群組", onClick: () => setOpenUnified(true) },
    { icon: <IoHourglassOutline />, label: "即將到期" },
    { icon: <IoMailOutline />, label: "最新動態" },
  ];

  return (
    <>
      {/* 底部導航欄容器 */}
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
                className={`
                  flex flex-col items-center justify-center text-xs h-auto py-1 px-2
                  ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-white/80"
                  } 
                  bg-transparent hover:bg-transparent
                `}
                onClick={() => handleButtonClick(index, btn.onClick)}
              >
                {btn.icon}
                <span className="mt-1">{btn.label}</span>
              </Button>

              {/* 底部短線元素 */}
              <div
                className={`
                  h-[3px] w-5 mt-1 rounded-full 
                  transition-opacity duration-300 ease-in-out
                  ${
                    isActive
                      ? "bg-white opacity-100"
                      : "bg-transparent opacity-0"
                  }
                `}
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
