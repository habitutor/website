import { useEffect, useState } from "react";

type FakePurchaseRecord = {
  firstName: string;
  lastInitial: string;
  major: string;
  university: string;
};

export type ActiveFakePurchase = {
  message: string;
  minutesAgo: number;
};

const FIRST_NAMES = [
  "Aldi",
  "Budi",
  "Citra",
  "Dewi",
  "Eko",
  "Fajar",
  "Gita",
  "Hadi",
  "Indra",
  "Joko",
  "Kartika",
  "Lia",
  "Maya",
  "Nadia",
  "Oki",
  "Putri",
  "Rafi",
  "Sinta",
  "Taufik",
  "Umar",
  "Vina",
  "Wulan",
  "Yoga",
  "Zahra",
  "Agus",
  "Bayu",
  "Cinta",
  "Dian",
  "Eka",
  "Farhan",
] as const;

const LAST_INITIALS = "ABCDEFGHJKLMNPRSTUW".split("");

const MAJORS = [
  "Kedokteran",
  "Teknik Informatika",
  "Psikologi",
  "Hukum",
  "Farmasi",
  "Akuntansi",
  "Manajemen",
  "Arsitektur",
  "Ilmu Komunikasi",
  "Teknik Elektro",
  "Biologi",
  "Kedokteran Gigi",
  "Statistika",
  "Hubungan Internasional",
  "Teknik Mesin",
  "Ilmu Politik",
  "Desain Komunikasi Visual",
  "Teknik Industri",
  "Nutrisi",
  "Pendidikan Dokter",
] as const;

const UNIVERSITIES = ["UI", "UGM", "ITB", "ITS", "UNAIR", "UB", "UNS", "UNDIP", "UNPAD", "IPB", "UNJ", "UNY"] as const;

export const FAKE_PURCHASE_RECORDS: FakePurchaseRecord[] = Array.from({ length: 100 }, (_, index) => ({
  firstName: FIRST_NAMES[index % FIRST_NAMES.length] ?? "Siswa",
  lastInitial: LAST_INITIALS[index % LAST_INITIALS.length] ?? "A",
  major: MAJORS[Math.floor(index / 5) % MAJORS.length] ?? "Kedokteran",
  university: UNIVERSITIES[Math.floor(index / 8) % UNIVERSITIES.length] ?? "UI",
}));

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getJakartaDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getJakartaSecondsSinceDayStart(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);

  return hour * 3600 + minute * 60 + second;
}

function getSlotDurationSeconds(dayKey: string, slotIndex: number) {
  return 600 + (hashString(`${dayKey}:${slotIndex}`) % 301);
}

function getDailyOrder(dayKey: string) {
  const order = FAKE_PURCHASE_RECORDS.map((_, index) => index);
  let seed = hashString(dayKey);

  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const temp = order[i];
    order[i] = order[j] ?? i;
    order[j] = temp ?? j;
  }

  return order;
}

function getCurrentSlot(dayKey: string, secondsSinceDayStart: number) {
  let elapsed = 0;
  let slotIndex = 0;

  while (elapsed + getSlotDurationSeconds(dayKey, slotIndex) <= secondsSinceDayStart) {
    elapsed += getSlotDurationSeconds(dayKey, slotIndex);
    slotIndex++;
  }

  return {
    slotIndex,
    slotStartSeconds: elapsed,
    slotDurationSeconds: getSlotDurationSeconds(dayKey, slotIndex),
  };
}

export function getActiveFakePurchase(now = new Date()): ActiveFakePurchase {
  const dayKey = getJakartaDayKey(now);
  const secondsSinceDayStart = getJakartaSecondsSinceDayStart(now);
  const { slotIndex, slotStartSeconds, slotDurationSeconds } = getCurrentSlot(dayKey, secondsSinceDayStart);
  const dailyOrder = getDailyOrder(dayKey);
  const recordIndex = dailyOrder[slotIndex % dailyOrder.length] ?? 0;
  const record = FAKE_PURCHASE_RECORDS[recordIndex] ?? FAKE_PURCHASE_RECORDS[0];

  const purchaseOffsetSeconds =
    45 + (hashString(`${dayKey}:${slotIndex}:purchase`) % Math.max(slotDurationSeconds - 90, 60));
  const purchaseSecondsAgo = Math.max(1, secondsSinceDayStart - slotStartSeconds - purchaseOffsetSeconds);

  return {
    minutesAgo: Math.max(1, Math.floor(purchaseSecondsAgo / 60)),
    message: `${record.firstName} ${record.lastInitial}*** baru saja membeli paket belajar (${record.major} ${record.university})`,
  };
}

export function useActiveFakePurchase() {
  const [purchase, setPurchase] = useState(() => getActiveFakePurchase());

  useEffect(() => {
    const update = () => setPurchase(getActiveFakePurchase());
    update();

    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return purchase;
}
