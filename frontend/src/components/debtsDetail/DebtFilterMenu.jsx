// frontend/components/debtsDetail/DebtFilterMenu.jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function DebtFilterMenu({
  members,
  currentUser,
  selectedMembers,
  setSelectedMembers,
}) {
  const [search, setSearch] = useState("");

  // 把自己放最上面
  const sortedMembers = useMemo(() => {
    if (!currentUser) return members;
    return [
      ...members.filter((m) => m.uid === currentUser.uid),
      ...members.filter((m) => m.uid !== currentUser.uid),
    ];
  }, [members, currentUser]);

  // 搜尋過濾
  const filteredMembers = useMemo(() => {
    if (!search) return sortedMembers;
    return sortedMembers.filter((m) =>
      m.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sortedMembers]);

  const toggleMember = (uid) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          篩選成員
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl p-2 w-64 max-h-80 overflow-y-auto"
        align="end"
      >
        {/* 搜尋框 */}
        <div className="mb-2">
          <Input
            placeholder="搜尋成員..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        </div>

        {/* 成員清單 */}
        {filteredMembers.map((m) => (
          <div
            key={m.uid}
            className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-700 rounded-md cursor-pointer"
            onClick={() => toggleMember(m.uid)}
          >
            <Checkbox
              checked={selectedMembers.includes(m.uid)}
              onCheckedChange={() => toggleMember(m.uid)}
              className="border-zinc-500"
            />
            <span
              className={`truncate ${
                m.uid === currentUser?.uid ? "text-emerald-400 font-bold" : ""
              }`}
            >
              {m.displayName}
            </span>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// frontend/components/debtsDetail/DebtFilterMenu.jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function DebtFilterMenu({
  members,
  currentUser,
  selectedMembers,
  setSelectedMembers,
}) {
  const [search, setSearch] = useState("");

  // 把自己放最上面
  const sortedMembers = useMemo(() => {
    if (!currentUser) return members;
    return [
      ...members.filter((m) => m.uid === currentUser.uid),
      ...members.filter((m) => m.uid !== currentUser.uid),
    ];
  }, [members, currentUser]);

  // 搜尋過濾
  const filteredMembers = useMemo(() => {
    if (!search) return sortedMembers;
    return sortedMembers.filter((m) =>
      m.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sortedMembers]);

  const toggleMember = (uid) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          篩選成員
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl p-2 w-64 max-h-80 overflow-y-auto"
        align="end"
      >
        {/* 搜尋框 */}
        <div className="mb-2">
          <Input
            placeholder="搜尋成員..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        </div>

        {/* 成員清單 */}
        {filteredMembers.map((m) => (
          <div
            key={m.uid}
            className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-700 rounded-md cursor-pointer"
            onClick={() => toggleMember(m.uid)}
          >
            <Checkbox
              checked={selectedMembers.includes(m.uid)}
              onCheckedChange={() => toggleMember(m.uid)}
              className="border-zinc-500"
            />
            <span
              className={`truncate ${
                m.uid === currentUser?.uid ? "text-emerald-400 font-bold" : ""
              }`}
            >
              {m.displayName}
            </span>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
