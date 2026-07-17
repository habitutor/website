import { format } from "date-fns";
import {
  getDisplayDate,
  getDisplayPhoneNumber,
  getDisplayReferralUsage,
  getDisplayRole,
} from "@/routes/admin/users/-components/user-row";

type ExportUser = {
  name: string;
  email: string;
  role: string | null;
  referralUsage: number | null;
  phoneNumber: string | null;
  isPremium: boolean | null;
  packageSlug: string | null;
  premiumExpiresAt: Date | null;
  createdAt: Date;
};

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function formatPremiumStatus(user: ExportUser) {
  if (!user.isPremium) return "Free";
  const packageLabel = user.packageSlug ?? "Premium";
  if (!user.premiumExpiresAt) return packageLabel;
  return `${packageLabel} until ${getDisplayDate(user.premiumExpiresAt)}`;
}

export function buildUsersCsv(users: ExportUser[]) {
  const headers = ["Name", "Email", "Role", "Referral Usage", "Phone Number", "Premium Status", "Joined"];
  const rows = users.map((user) =>
    [
      user.name,
      user.email,
      getDisplayRole(user.role),
      String(getDisplayReferralUsage(user.referralUsage)),
      getDisplayPhoneNumber(user.phoneNumber),
      formatPremiumStatus(user),
      getDisplayDate(user.createdAt),
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadUsersCsv(
  users: ExportUser[],
  filename = `habitutor-users-${format(new Date(), "yyyy-MM-dd")}.csv`,
) {
  const csv = buildUsersCsv(users);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
