import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

const WELCOME_VIDEO_EMBED_URL = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";

export function WelcomeVideoDialog({ open }: { open: boolean }) {
  const queryClient = useQueryClient();
  const [understood, setUnderstood] = useState(false);

  const markSeenMutation = useMutation(
    orpc.profile.markWelcomeVideoSeen.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.profile.me.queryKey() });
      },
    }),
  );

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Selamat datang di Habitutor!</DialogTitle>
          <DialogDescription>
            Tonton video singkat ini dulu ya, biar kamu tahu cara memaksimalkan semua fitur belajarmu.
          </DialogDescription>
        </DialogHeader>

        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <iframe
            src={WELCOME_VIDEO_EMBED_URL}
            title="Video selamat datang Habitutor"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <DialogFooter className="items-center gap-3 sm:justify-between">
          <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
            <Checkbox checked={understood} onCheckedChange={(checked) => setUnderstood(checked === true)} />
            Saya sudah menonton dan mengerti
          </Label>
          <Button disabled={!understood || markSeenMutation.isPending} onClick={() => markSeenMutation.mutate({})}>
            {markSeenMutation.isPending ? "Menyimpan..." : "Lanjutkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
