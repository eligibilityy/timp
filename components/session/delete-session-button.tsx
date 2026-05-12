"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { defineSound } from "@web-kits/audio";
import { collapse } from "@/.web-kits/crisp";
import { deleteSession, restoreSession } from "@/lib/supabase/sessions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionData {
  id: string;
  user_id: string;
  title: string | null;
  reflection: string | null;
  duration_seconds: number;
  focus_score: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  tagIds: string[];
}

export function DeleteSessionButton({ session }: { session: SessionData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    defineSound(collapse)();
    await deleteSession(session.id);
    router.refresh();

    toast("Session deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await restoreSession(session);
          router.refresh();
        },
      },
      duration: 5000,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete session?</DialogTitle>
            <DialogDescription>
              This will remove &quot;{session.title || "Untitled session"}&quot; from your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
