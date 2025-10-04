// frontend/components/debtsDetail/GroupMembers.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupMembers({ members }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-zinc-800 rounded-xl shadow-lg">
      <h2 className="text-lg font-bold text-zinc-300">成員</h2>
      <div className="flex -space-x-3">
        {members.map((m) => (
          <Avatar
            key={m.uid}
            className="w-10 h-10 border-2 border-zinc-900 shadow-md"
          >
            <AvatarImage src={m.photoUrl} alt={m.displayName} />
            <AvatarFallback className="bg-zinc-700 text-sm">
              {m.displayName[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
