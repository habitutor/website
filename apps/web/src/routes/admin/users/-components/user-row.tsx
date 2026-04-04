import { Crown, DotsThree } from "@phosphor-icons/react";
import { ROLES } from "@habitutor/shared";
import { format } from "date-fns";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  referralUsage: number | null;
  phoneNumber: string | null;
  isPremium: boolean | null;
  premiumExpiresAt: Date | null;
  createdAt: Date;
}

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

export function UserRow({ user }: UserRowProps) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : undefined,
  );

  const isPremium = user.isPremium ?? false;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
            {getDisplayRole(user.role)}
          </span>
        </TableCell>
        <TableCell className="font-medium">{getDisplayReferralUsage(user.referralUsage)}</TableCell>
        <TableCell className="font-medium">{getDisplayPhoneNumber(user.phoneNumber)}</TableCell>
        <TableCell>
          {isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <Crown className="size-3" weight="fill" />
              Premium
              {user.premiumExpiresAt && (
                <span className="text-amber-600/70 dark:text-amber-400/70">
                  until {getDisplayDate(user.premiumExpiresAt)}
                </span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Free
            </span>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{getDisplayDate(user.createdAt)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree className="size-5" weight="bold" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setManageDialogOpen(true)}>
                <Crown className="mr-2 size-4" />
                {isPremium ? "Manage Premium" : "Grant Premium"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

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
    </>
  );
}
