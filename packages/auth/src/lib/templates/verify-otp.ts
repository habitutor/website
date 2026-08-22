export function generateVerifyOtpEmail(otp: string): string {
  return `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Verifikasi Email Kamu</h2>
            <p>Gunakan kode berikut untuk memverifikasi akun Habitutor kamu:</p>
            <div style="margin: 20px 0;">
              <span style="background-color: #FFF7F0; color: #1B273B; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 28px; letter-spacing: 8px; display: inline-block;">
                ${otp}
              </span>
            </div>
            <p>Kode ini berlaku selama 5 menit. Jika kamu tidak merasa membuat akun Habitutor, abaikan email ini.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #888;">&copy; 2026 Habitutor. Semua hak dilindungi undang-undang.</p>
          </div>
        `;
}
