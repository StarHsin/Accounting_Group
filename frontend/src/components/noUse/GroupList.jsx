//frontend/components/GropList.jsx
import React, { useEffect, useState } from "react";

export default function GroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/groups`)
      .then((res) => res.json())
      .then(setGroups);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">群組列表</h2>
      <ul>
        {groups.map((g) => (
          <li key={g.id} className="mb-2 border-b border-gray-600">
            {g.name} ({g.members.length} 人)
          </li>
        ))}
      </ul>
    </div>
  );
}
