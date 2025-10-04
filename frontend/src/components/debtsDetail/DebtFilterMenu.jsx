// frontend/components/debtsDetail/DebtFilterMenu.jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function DebtFilterMenu({ showOnlyMine, setShowOnlyMine }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          篩選
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl">
        <DropdownMenuLabel className="text-zinc-400">
          顯示設定
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuCheckboxItem
          checked={showOnlyMine}
          onCheckedChange={setShowOnlyMine}
          className="focus:bg-zinc-700 focus:text-white"
        >
          只看自己
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
