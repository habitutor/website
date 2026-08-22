export function generateDeleteAccountEmail(userName: string, url: string): string {
  return `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Halo ${userName},</h2>
            <p>Kami menerima permintaan untuk <strong>menghapus akun Habitutor Anda secara permanen</strong>. Seluruh progres belajar, streak, dan data akun akan dihapus dan tidak dapat dikembalikan.</p>
            <p>Jika Anda yakin, klik tombol di bawah ini untuk mengonfirmasi penghapusan:</p>
            <div style="margin: 20px 0;">
              <a href="${url}" style="background-color: #E5484D; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Hapus Akun Saya
              </a>
            </div>
            <p>Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman dan tidak akan dihapus.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #888;">&copy; 2026 Habitutor. Semua hak dilindungi undang-undang.</p>
          </div>
        `;
}
