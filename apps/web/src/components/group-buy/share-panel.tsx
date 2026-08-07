import { CopyIcon, ShareNetworkIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildGroupBuyInviteUrl, buildGroupBuyWhatsAppMessage, buildWhatsAppShareUrl } from "@/lib/group-buy-copy";
import { cn } from "@/lib/utils";

export function GroupBuySharePanel({
  inviteCode,
  paidCount,
  requiredMembers,
  className,
}: {
  inviteCode: string;
  paidCount: number;
  requiredMembers: number;
  className?: string;
}) {
  const inviteUrl = buildGroupBuyInviteUrl(inviteCode);
  const message = buildGroupBuyWhatsAppMessage({ inviteCode, paidCount, requiredMembers });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link undangan disalin!");
    } catch {
      toast.error("Gagal menyalin link. Salin manual ya.");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: "Patungan Paket Perintis 2027", text: message });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <a
        href={buildWhatsAppShareUrl(message)}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-1000 bg-[#25D366] px-4 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#1ebe5b]"
      >
        <WhatsappLogoIcon weight="fill" className="size-5" />
        Ajak Teman via WhatsApp
      </a>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handleCopy}>
          <CopyIcon />
          Salin Link
        </Button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button type="button" variant="outline" className="flex-1" onClick={handleNativeShare}>
            <ShareNetworkIcon />
            Bagikan
          </Button>
        )}
      </div>

      <p className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-center text-xs break-all text-muted-foreground">
        {inviteUrl}
      </p>
    </div>
  );
}
