import { House, Plus, ListCheck, ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";

export default function Bottom_functionality_bar({ setGroups }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-around py-4 bg-zinc-800 border-t border-zinc-700 fixed bottom-0 left-0 w-full shadow-lg">
        <Button
          variant="ghost"
          className="flex flex-col items-center text-zinc-100"
        >
          <House />
          <span className="text-xs">主頁</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center text-gray-500"
        >
          <ChartNoAxesCombined className="h-6 w-6" />
          <span className="text-xs">統計</span>
        </Button>
        <Button
          className="flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
          onClick={() => setOpenCreate(true)}
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center text-gray-500"
          onClick={() => setOpenJoin(true)}
        >
          <ListCheck className="h-6 w-6" />
          <span className="text-xs">加入群組</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center text-gray-500"
        >
          <ListCheck className="h-6 w-6" />
          <span className="text-xs">群組清單</span>
        </Button>
      </nav>

      {openCreate && (
        <CreateGroupModal setOpen={setOpenCreate} setGroups={setGroups} />
      )}
      {openJoin && (
        <JoinGroupModal setOpen={setOpenJoin} setGroups={setGroups} />
      )}
    </>
  );
}
