import { CrownIcon, LockKeyIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePtnTourSettings } from "../-hooks";

/** Pop-up ajakan upgrade saat rekaman terkunci (masa gratis habis atau khusus Premium). */
export function RecordingLockedDialog({ message, onClose }: { message: string | null; onClose: () => void }) {
  const { data: settings } = usePtnTourSettings();
  return (
    <Dialog open={message !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sr-sun-100 text-sr-amber-700">
            <LockKeyIcon weight="fill" className="size-7" />
          </span>
          <DialogTitle>Rekaman ini terkunci</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="rounded-sr-lg bg-sr-blue-50 p-4 text-sm text-sr-ink-2">
          <p className="flex items-center gap-2 font-black text-sr-ink">
            <CrownIcon weight="fill" className="text-sr-amber-700" />
            {settings?.promo_title ?? "Siap lanjut belajar lebih serius?"}
          </p>
          <p className="mt-1 text-sr-muted">{settings?.promo_text}</p>
        </div>
        <Button asChild className="w-full" onClick={onClose}>
          <Link to={(settings?.promo_cta_url ?? "/premium") as "/premium"}>
            {settings?.promo_cta_label ?? "Lihat Paket Premium"}
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
