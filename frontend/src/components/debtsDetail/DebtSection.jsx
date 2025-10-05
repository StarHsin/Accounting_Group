// frontend/components/debtsDetail/DebtSection.jsx
import DebtList from "./DebtList";
import DebtFilterMenu from "./DebtFilterMenu";

export default function DebtSection({
  debts,
  groupId,
  members,
  currentUser,
  selectedMembers,
  setSelectedMembers,
  setDebts,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-zinc-100 mt-2">債務列表</h2>
        <DebtFilterMenu
          members={members}
          currentUser={currentUser}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
        />
      </div>
      <DebtList
        debts={debts}
        onDelete={(id) => {
          fetch(`${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${id}`, {
            method: "DELETE",
          }).then(() => setDebts((prev) => prev.filter((d) => d.id !== id)));
        }}
        onEdit={(updated) => {
          setDebts((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
        }}
        onMarkPaid={(id) => {
          fetch(`${import.meta.env.VITE_API_URL}/api/debts/${groupId}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paid: true }),
          })
            .then((res) => res.json())
            .then((updated) => {
              setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
            })
            .catch(console.error);
        }}
      />
    </div>
  );
}
