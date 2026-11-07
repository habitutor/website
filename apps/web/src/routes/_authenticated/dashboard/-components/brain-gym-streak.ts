const KEY = "brain-gym-streak-celebration";

type BrainGymStreakChange = { from: number; to: number };

// Disimpan lewat sessionStorage karena submit terjadi di halaman soal, sedangkan popup tampil di halaman hasil.
export function rememberBrainGymStreak(change: BrainGymStreakChange) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(change));
  } catch {
    // Popup perayaan hanya pemanis; abaikan kalau penyimpanan diblokir.
  }
}

export function takeBrainGymStreak(): BrainGymStreakChange | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as BrainGymStreakChange;
    return Number.isFinite(parsed.from) && Number.isFinite(parsed.to) && parsed.to > parsed.from ? parsed : null;
  } catch {
    return null;
  }
}
