import { ArrowSquareOutIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
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
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { orpc } from "@/utils/orpc";

// Link yang masih placeholder (diawali "ISI_") tidak ditampilkan supaya tidak ada tombol rusak.
const WHATSAPP_GROUPS = [
  { label: "Gabung Grup Paket Premium 1 Tahun (Paket Perintis 2027)", href: COMMUNITY_LINKS.premiumWhatsapp },
  { label: "Gabung Grup Paket Premium 2 Bulan", href: COMMUNITY_LINKS.premium2BulanWhatsapp },
].filter((group) => !group.href.startsWith("ISI_"));

export function PremiumWhatsappDialog({ open }: { open: boolean }) {
  const queryClient = useQueryClient();
  const [hasJoined, setHasJoined] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const markJoinedMutation = useMutation(
    orpc.profile.markPremiumWhatsappJoined.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.profile.me.queryKey() });
      },
    }),
  );

  const handleConfirm = () => {
    // Close immediately so a failed request can never trap the user in the
    // dialog; if the write fails, the popup simply reappears on a later visit.
    setDismissed(true);
    markJoinedMutation.mutate({});
  };

  return (
    <Dialog open={open && !dismissed}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp sm:mx-0">
            <WhatsappLogoIcon size={28} weight="fill" />
          </div>
          <DialogTitle>Gabung Komunitas WhatsApp Premium</DialogTitle>
          <DialogDescription>
            Dapatkan pengumuman kelas, diskusi belajar, dan informasi khusus member premium Habitutor. Pilih grup sesuai
            paket yang kamu ambil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {WHATSAPP_GROUPS.map((group) => (
            <Button key={group.label} asChild className="w-full bg-whatsapp text-white hover:bg-whatsapp/90">
              <a href={group.href} target="_blank" rel="noopener noreferrer">
                {group.label}
                <ArrowSquareOutIcon />
              </a>
            </Button>
          ))}
        </div>

        <DialogFooter className="items-stretch gap-4 sm:flex-col">
          <Label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-normal">
            <Checkbox
              className="mt-0.5"
              checked={hasJoined}
              onCheckedChange={(checked) => setHasJoined(checked === true)}
            />
            I have joined the WhatsApp community
          </Label>
          <Button disabled={!hasJoined} onClick={handleConfirm}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
