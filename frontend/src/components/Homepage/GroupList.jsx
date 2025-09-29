// frontend/components/Homepage/GroupList.jsx
import GroupCard from "./GroupCard";

export default function GroupList({ groups, onNavigate }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onNavigate(group.id)}
        />
      ))}
    </div>
  );
}
