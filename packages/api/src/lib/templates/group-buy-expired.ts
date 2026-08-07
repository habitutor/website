function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function generateGroupBuyExpiredEmail({
  userName,
  seatPrice,
  topupAmount,
  groupPageUrl,
}: {
  userName: string;
  seatPrice: number;
  topupAmount: number;
  groupPageUrl: string;
}): string {
  return `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Halo ${userName},</h2>
            <p>Sayangnya, grup patungan Paket Perintis 2027 kamu belum terisi 3 orang dalam 48 jam, jadi grupnya tidak jadi terbentuk.</p>
            <p>Tenang, uang kamu aman. Kamu punya dua pilihan:</p>
            <ol>
              <li style="margin-bottom: 8px;"><strong>Bayar selisihnya (${formatRupiah(topupAmount)})</strong> untuk langsung membuka akses Premium dengan harga normal.</li>
              <li><strong>Minta refund ${formatRupiah(seatPrice)}</strong> — refund diproses manual oleh tim kami dan bisa memakan waktu hingga 7 hari kerja.</li>
            </ol>
            <div style="margin: 20px 0;">
              <a href="${groupPageUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Pilih Opsi Kamu
              </a>
            </div>
            <p>Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser kamu:</p>
            <p style="word-break: break-all; color: #666;">${groupPageUrl}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #888;">&copy; 2026 Habitutor. Semua hak dilindungi undang-undang.</p>
          </div>
        `;
}
