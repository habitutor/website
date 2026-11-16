import { useEffect, useState } from "react";

const SEEN_KEY = "habitutor:affiliate-seen";

/**
 * Penanda "Baru" di foto profil sampai pengguna pertama kali membuka halaman Ajak Teman.
 * Hanya disimpan di browser ini; kalau penyimpanan tidak tersedia, penanda tidak ditampilkan.
 */
export function useAffiliateSeen() {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    try {
      setIsNew(window.localStorage.getItem(SEEN_KEY) === null);
    } catch {
      setIsNew(false);
    }
  }, []);

  const markSeen = () => {
    try {
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      /* abaikan */
    }
    setIsNew(false);
  };

  return { isNew, markSeen };
}
