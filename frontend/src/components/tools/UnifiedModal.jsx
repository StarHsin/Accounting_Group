import { useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function UnifiedModal({ setOpen, setGroups }) {
  const [mode, setMode] = useState("create"); // create | join
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const auth = getAuth(app);
  const user = auth.currentUser;

  const handleCreate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          members: [
            {
              uid: user.uid,
              displayName: user.displayName,
              photoUrl: user.photoURL,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups((prev) => [...prev, data]);
        setOpen(false);
      } else setError(data.error || "建立群組失敗");
    } catch (err) {
      console.error(err);
      setError("網路錯誤，請稍後再試");
    }
  };

  const handleJoin = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/groups/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            member: {
              uid: user.uid,
              displayName: user.displayName,
              photoUrl: user.photoURL,
            },
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setGroups((prev) => [...prev, data]);
        setOpen(false);
      } else setError(data.error || "加入群組失敗");
    } catch (err) {
      console.error(err);
      setError("網路錯誤，請稍後再試");
    }
  };

  return (
    <Dialog open onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-800 text-zinc-100 w-[90%] max-w-md rounded-xl shadow-lg border-0">
        <DialogHeader className="w-[50%]">
          <DialogTitle>
            <Select
              value={mode}
              onValueChange={setMode}
              className=" bg-zinc-900 text-white"
            >
              <SelectTrigger className="border-0 text-lg rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white text-lg">
                <SelectItem value="create">建立群組</SelectItem>
                <SelectItem value="join">加入群組</SelectItem>
              </SelectContent>
            </Select>
          </DialogTitle>
        </DialogHeader>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {mode === "create" ? (
          <div className="flex flex-col gap-4 mt-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入群組名稱"
              className="bg-zinc-700 text-white placeholder-zinc-400"
            />
            <div className="flex justify-end gap-2">
              <Button
                className="border-zinc-500 bg-transparent border-2 text-zinc-200"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                className="border-zinc-500 bg-transparent border-2 text-zinc-200"
                onClick={handleCreate}
              >
                建立
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="輸入群組碼"
              className="bg-zinc-700 text-white placeholder-zinc-400"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-zinc-500 bg-transparent border-2 text-zinc-200"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="outline"
                className="border-zinc-500 bg-transparent border-2 text-zinc-200"
                onClick={handleJoin}
              >
                加入
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
