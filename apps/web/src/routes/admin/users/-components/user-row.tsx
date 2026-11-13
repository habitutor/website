import { CalendarBlank, Crown, DotsThree, Phone, XCircle } from "@phosphor-icons/react";
import { ROLES } from "@habitutor/shared/auth-domain";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { ConfirmPremiumDialog } from "./confirm-premium-dialog";
import { ManagePremiumDialog } from "./manage-premium-dialog";
import { RevokePremiumDialog } from "./revoke-premium-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  referralUsage: number | null;
  phoneNumber: string | null;
  isPremium: boolean | null;
  packageSlug: string | null;
  premiumExpiresAt: Date | null;
  createdAt: Date;
}

export type AdminUser = User;

interface UserRowProps {
  user: User;
}

export function getDisplayRole(role: string | null) {
  return role || ROLES.USER;
}

export function getDisplayReferralUsage(referralUsage: number | null) {
  return referralUsage ?? 0;
}

export function getDisplayPhoneNumber(phoneNumber: string | null) {
  return phoneNumber ?? "N/A";
}

export function getDisplayDate(date: Date) {
  return format(new Date(date), "MMM d, yyyy");
}

const formatDateId = (date: Date) => format(new Date(date), "d MMM yyyy", { locale: idLocale });

function UserAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sm font-black text-sr-blue-700 ring-1 ring-sr-blue-100 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function PremiumBadge({ user }: { user: User }) {
  if (!user.isPremium) {
    return (
      <span className="inline-flex items-center rounded-full bg-sr-ivory px-2.5 py-1 text-xs font-bold text-sr-muted ring-1 ring-sr-line">
        Gratis
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-sr-sun-100 px-2.5 py-1 text-xs font-bold text-sr-amber-700">
        <Crown className="size-3" weight="fill" />
        {user.packageSlug ?? "Premium"}
      </span>
      {user.premiumExpiresAt && (
        <span className="pl-1 text-[11px] text-sr-muted">sampai {formatDateId(user.premiumExpiresAt)}</span>
      )}
    </span>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  const display = getDisplayRole(role);
  return (
    <span
      className={
        display === ROLES.ADMIN
          ? "inline-flex items-center rounded-full bg-sr-ink px-2.5 py-1 text-xs font-bold text-white capitalize"
          : "inline-flex items-center rounded-full bg-sr-blue-50 px-2.5 py-1 text-xs font-bold text-sr-blue-700 capitalize"
      }
    >
      {display}
    </span>
  );
}

function useUserActions(user: User) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : undefined,
  );
  const isPremium = user.isPremium ?? false;

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <DotsThree className="size-5" weight="bold" />
          <span className="sr-only">Buka menu aksi untuk {user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setManageDialogOpen(true)}>
          <Crown className="mr-2 size-4" />
          {isPremium ? "Kelola Premium" : "Beri Premium"}
        </DropdownMenuItem>
        {isPremium && (
          <DropdownMenuItem className="text-destructive" onClick={() => setRevokeDialogOpen(true)}>
            <XCircle className="mr-2 size-4" />
            Cabut Premium
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const dialogs = (
    <>
      <ManagePremiumDialog
        user={user}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onConfirm={() => {
          setManageDialogOpen(false);
          setConfirmDialogOpen(true);
        }}
      />
      <ConfirmPremiumDialog
        user={user}
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        selectedDate={selectedDate}
        onSuccess={() => {
          setConfirmDialogOpen(false);
          setSelectedDate(undefined);
        }}
      />
      <RevokePremiumDialog user={user} open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen} />
    </>
  );

  return { menu, dialogs };
}

export function UserRow({ user }: UserRowProps) {
  const { menu, dialogs } = useUserActions(user);

  return (
    <>
      <TableRow className="group">
        <TableCell>
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate font-bold text-sr-ink">{user.name}</p>
              <p className="truncate text-xs text-sr-muted">{user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <RoleBadge role={user.role} />
        </TableCell>
        <TableCell>
          <PremiumBadge user={user} />
        </TableCell>
        <TableCell className="text-sm text-sr-ink">{getDisplayReferralUsage(user.referralUsage)}x</TableCell>
        <TableCell className="text-sm text-sr-ink">{user.phoneNumber ?? "-"}</TableCell>
        <TableCell className="text-sm text-sr-muted">{formatDateId(user.createdAt)}</TableCell>
        <TableCell className="text-right">{menu}</TableCell>
      </TableRow>
      {dialogs}
    </>
  );
}

/** Tampilan kartu untuk layar kecil (tabel tidak muat di HP). */
export function UserCard({ user }: UserRowProps) {
  const { menu, dialogs } = useUserActions(user);

  return (
    <li className="group space-y-3 px-4 py-4 transition-colors duration-200 active:bg-sr-blue-50/60">
      <div className="flex items-start gap-3">
        <UserAvatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-sr-ink">{user.name}</p>
          <p className="truncate text-xs text-sr-muted">{user.email}</p>
        </div>
        {menu}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RoleBadge role={user.role} />
        <PremiumBadge user={user} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sr-muted">
        <span className="inline-flex items-center gap-1">
          <Phone className="size-3.5" /> {user.phoneNumber ?? "-"}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarBlank className="size-3.5" /> Bergabung {formatDateId(user.createdAt)}
        </span>
        <span>Referral dipakai {getDisplayReferralUsage(user.referralUsage)}x</span>
      </div>
      {dialogs}
    </li>
  );
}
