// frontend/components/debtsDetail/GroupMembers.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export default function GroupMembers({ members }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl shadow-lg border-2 border-zinc-700 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-2 relative z-10">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <Users className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-zinc-200">成員</h2>
        <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs font-semibold text-zinc-400">
          {members.length}
        </span>
      </div>

      <div className="flex -space-x-3 relative z-10">
        {members.map((m, idx) => (
          <Avatar
            key={m.uid}
            className="w-11 h-11 border-3 border-zinc-900 shadow-lg transition-transform hover:scale-110 hover:z-10 cursor-pointer ring-2 ring-zinc-800"
            style={{ zIndex: members.length - idx }}
            title={m.displayName}
          >
            <AvatarImage
              src={m.photoUrl || "/placeholder.svg"}
              alt={m.displayName}
            />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-bold">
              {m.displayName[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
