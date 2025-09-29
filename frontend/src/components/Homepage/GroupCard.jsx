// frontend/components/Homepage/GroupCard.jsx
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupCard({ group, onClick }) {
  const membersToShow = group.members?.slice(0, 3) || [];
  const extraCount =
    group.members && group.members.length > 3 ? group.members.length - 3 : 0;

  return (
    <Card
      key={group.id}
      className="p-4 bg-zinc-800 rounded-lg shadow-md flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* 成員頭像 (只顯示 3 個，多的用 "+N") */}
        <div className="flex -space-x-2 items-center">
          {membersToShow.map((m, idx) => (
            <Avatar key={idx} className="w-8 h-8">
              <AvatarImage src={m.photoUrl} alt={m.displayName} />
              <AvatarFallback>{m.displayName[0]}</AvatarFallback>
            </Avatar>
          ))}
          {extraCount > 0 && (
            <span className="ml-2 text-sm text-gray-400">+{extraCount}</span>
          )}
        </div>

        <div>
          <h3 className="text-md font-semibold text-zinc-100">{group.name}</h3>
          <p className="text-sm text-gray-400">群組碼: {group.code}</p>
        </div>
      </div>
      <ArrowRight className="text-gray-400" />
    </Card>
  );
}
