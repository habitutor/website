import { useState, useEffect } from "react";

const AVATARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  src: `/avatar/tupai${i + 1}.webp`,
  label: `Tupai ${i + 1}`,
}));

const AvatarItem = ({
  av,
  selected,
  onSelect,
  size = 76,
}: {
  av: { id: number; src: string; label: string };
  selected: boolean;
  onSelect: (id: number) => void;
  size?: number;
}) => (
  <div
    onClick={() => onSelect(av.id)}
    className="avatar-item"
    style={{
      width: size,
      height: size,
      minWidth: size,
      borderRadius: 12,
      background: "#FFF3C4",
      border: selected ? "2.5px solid #22C55E" : "2px solid #E4E4E7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      flexShrink: 0,
      overflow: "hidden",
      transition: "transform 0.15s, border 0.15s",
    }}
  >
    <img
      src={av.src}
      alt={av.label}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        const next = e.currentTarget.nextSibling as HTMLElement;
        if (next) next.style.display = "flex";
      }}
    />
    <span
      style={{
        display: "none",
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
      }}
    >
      🐿️
    </span>
    {selected && (
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#22C55E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

function SaveRow({ onSave }: { onSave: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
      <hr style={{ border: "none", borderTop: "1px solid #E4E4E7", margin: 0 }} />
      <div className="save-row-inner" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="save-btn"
          onClick={onSave}
          style={{
            height: 42,
            padding: "0 32px",
            background: "#3650A2",
            border: "1px solid #3650A2",
            borderRadius: 8,
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function Toast({ show }: { show: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: show ? "translate(-50%, 0)" : "translate(-50%, 20px)",
        opacity: show ? 1 : 0,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: "none",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#22C55E",
        color: "white",
        padding: "12px 24px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Profil berhasil disimpan
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState<"data" | "customize">("data");
  const [formData, setFormData] = useState({ email: "Habitutor@gmail.com", phone: "", name: "" });
  const [customize, setCustomize] = useState({ kampus: "", jurusan: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const affiliateCode = "Habit#1234!";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);

    // Baca avatar yang sudah disimpan sebelumnya
    const saved = localStorage.getItem("selectedAvatar");
    if (saved) {
      const match = saved.match(/tupai(\d+)\.webp/);
      if (match) setSelectedAvatar(Number(match[1]));
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const src = `/avatar/tupai${selectedAvatar}.webp`;

    // Simpan ke localStorage
    localStorage.setItem("selectedAvatar", src);

    // Beritahu header via custom event
    window.dispatchEvent(new CustomEvent("avatarChanged", { detail: { src } }));

    // Tampilkan notif
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <style>{`
        @keyframes popUp {
          0%   { transform: translateY(60px); opacity: 0; }
          60%  { transform: translateY(-10px); opacity: 1; }
          80%  { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes cardSlideUp {
          0%   { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .profile-page-bg {
          background: #F4FAFF;
          min-height: calc(100vh - 86px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .mascot-popup { animation: popUp 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .avatar-item:hover { transform: scale(1.05); }
        .tab-active { background: #3650A2 !important; color: white !important; }
        .tab-inactive { background: white !important; color: #3650A2 !important; }
        input:focus { outline: none; }

        /* Dekorasi bulatan */
        .deco-1 {
          position: fixed; top: 497px; left: -101px;
          width: 525px; height: 525px; border-radius: 50%;
          border: 2px solid #B3DFF5; background: #D9EFFA;
          pointer-events: none; z-index: 0;
        }
        .deco-2 {
          position: fixed; top: 406px; left: 22px;
          pointer-events: none; z-index: 0;
        }
        .deco-3 {
          position: fixed; top: 542px; right: 0;
          width: 314px; height: 314px; border-radius: 50%;
          border: 2px solid #B3DFF5; background: #D9EFFA;
          pointer-events: none; z-index: 0;
        }
        .deco-4 {
          position: fixed; top: 436px; right: -42px;
          pointer-events: none; z-index: 0;
        }

        @media (max-width: 768px) {
          .profile-page-bg { min-height: 100vh; overflow: auto; }
          .profile-card {
            padding: 0 0 32px 0 !important;
            gap: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          .back-btn-wrap { display: none !important; }
          .hero-wrap { padding: 16px 16px 0 16px !important; }
          .hero-banner { height: 140px !important; }
          .hero-title { font-size: 26px !important; line-height: 1.3 !important; }
          .hero-sub { font-size: 13px !important; }
          .hero-mascot { width: 115px !important; height: 106px !important; right: 8px !important; }
          .page-body { padding: 0 16px !important; gap: 16px !important; margin-top: 26px !important; }
          .form-row { flex-direction: column !important; }
          .form-col { width: 100% !important; }
          .tab-btn { flex: 1 !important; }
          .save-btn { width: 100% !important; }
          .save-row-inner { justify-content: flex-end !important; }
          .save-wrap { padding-left: 16px !important; padding-right: 16px !important; }
          .banner-circle-wrap {
            width: 183px !important; height: 185px !important;
            top: auto !important; bottom: 0 !important;
          }
          .banner-circle-inner {
            width: 183px !important; height: 185px !important;
            top: auto !important; bottom: -92px !important; right: -52px !important;
          }
          .customize-row { flex-direction: column !important; }
          .customize-fields { width: 100% !important; order: 2 !important; }
          .customize-avatars { width: 100% !important; order: 1 !important; }
          .avatar-scroll-mobile { display: flex !important; }
          .avatar-grid-desktop { display: none !important; }
          .referral-row { flex-direction: column !important; }
          .referral-row > div:first-child { width: 100% !important; justify-content: flex-start !important; }
          .deco-1, .deco-2, .deco-3, .deco-4 { display: none; }
        }
      `}</style>

      {/* Notif toast */}
      <Toast show={showToast} />

      {/* Background dan dekorasi */}
      <div className="profile-page-bg" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}>

        {/* Dekorasi bulatan */}
        <div className="deco-1" />
        <div className="deco-2">
          <svg width="79" height="79" viewBox="0 0 79 79" fill="none">
            <circle cx="39.5" cy="39.5" r="38.5" fill="#D9EFFA" stroke="#B3DFF5" strokeWidth="2" />
          </svg>
        </div>
        <div className="deco-3" />
        <div className="deco-4">
          <svg width="83" height="126" viewBox="0 0 83 126" fill="none">
            <path d="M62.5 1C96.458 1 124 28.7508 124 63C124 97.2492 96.458 125 62.5 125C28.542 125 1 97.2492 1 63C1 28.7508 28.542 1 62.5 1Z" fill="#D9EFFA" stroke="#B3DFF5" strokeWidth="2" />
          </svg>
        </div>

        {/* kartu */}
        <main
          className="profile-card"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 1280,
            background: "white",
            borderLeft: "1px solid #D2D2D2",
            borderRight: "1px solid #D2D2D2",
            borderBottom: "1px solid #D2D2D2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            padding: "40px 0",
            boxSizing: "border-box",
            animation: "cardSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
            minHeight: "calc(100vh - 86px)",
          }}
        >
          {/* Tombol kembali */}
          <div className="back-btn-wrap" style={{ width: "100%", paddingLeft: 54, paddingRight: 54, boxSizing: "border-box" }}>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                background: "#3650A2", border: "none", borderRadius: 8, color: "white",
                fontSize: 12, fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>

          {/* Hero banner */}
          <div className="hero-wrap" style={{ position: "relative", width: "100%", flexShrink: 0, paddingLeft: 54, paddingRight: 54, boxSizing: "border-box" }}>
            <div
              className="hero-banner"
              style={{
                position: "relative", width: "100%", height: 117, borderRadius: 10,
                border: "2px solid #B3DFF5", background: "#D9EFFA",
                overflow: "visible", flexShrink: 0,
              }}
            >
              {/* Bulatan biru dalam banner */}
              <div className="banner-circle-wrap" style={{
                position: "absolute", top: 0, right: 0, overflow: "hidden",
                borderTopRightRadius: 10, borderBottomRightRadius: 10,
                width: 280, height: "100%", pointerEvents: "none",
              }}>
                <div className="banner-circle-inner" style={{
                  position: "absolute", width: 310, height: 310, borderRadius: "50%",
                  border: "2px solid #5BBAE9", background: "#87CCEF", top: -47, right: -41,
                }} />
              </div>

              {/* Teks */}
              <div style={{ position: "absolute", top: 21, left: 24, zIndex: 1, maxWidth: "55%" }}>
                <h1 className="hero-title" style={{ margin: 0, fontSize: 34, lineHeight: "51px", color: "#3650A2", fontFamily: "inherit", fontWeight: 400 }}>
                  Halo, <span style={{ fontWeight: 700 }}>Melinda!</span>
                </h1>
                <p className="hero-sub" style={{ margin: 0, fontSize: 14, color: "#3650A2", fontWeight: 400 }}>
                  Lengkapi informasi profilmu di bawah ini
                </p>
              </div>

              {/* Gambar tupai — key berubah tiap ganti avatar → re-mount → animasi ulang */}
              <div
                key={selectedAvatar}
                className="mascot-popup hero-mascot"
                style={{ position: "absolute", bottom: 0, right: 24, width: 222, height: 205, zIndex: 3, pointerEvents: "none" }}
              >
                <img
                  src={`/avatar/tupai${selectedAvatar}.webp`}
                  alt="Maskot"
                  style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* Konten */}
          <div className="page-body" style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, width: "100%", paddingLeft: 54, paddingRight: 54, boxSizing: "border-box" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
              <button
                className={`tab-btn ${tab === "data" ? "tab-active" : "tab-inactive"}`}
                onClick={() => setTab("data")}
                style={{ height: 37, padding: "0 14px", border: "1px solid #3650A2", borderRadius: 8, fontSize: 12, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Data Dirimu
              </button>
              <button
                className={`tab-btn ${tab === "customize" ? "tab-active" : "tab-inactive"}`}
                onClick={() => setTab("customize")}
                style={{ height: 37, padding: "0 14px", border: "1px solid #3650A2", borderRadius: 8, fontSize: 12, fontFamily: "inherit", fontWeight: 400, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Customize
              </button>
            </div>

            {/* TAB: Data Diri */}
            {tab === "data" && (
              <div className="form-row" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Kiri: form fields */}
                <div className="form-col" style={{ display: "flex", flexDirection: "column", gap: 12, width: "47%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Email</label>
                    <div style={{ border: "1px solid #D2D2D2", borderRadius: 6, background: "#E8E8E8", padding: "1px 3px" }}>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: "100%", border: "none", background: "transparent", padding: "8px", fontSize: 13, color: "#333", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Nomor Telepon</label>
                    <div style={{ border: "1px solid #E4E4E7", borderRadius: 6, background: "white", padding: "1px 3px" }}>
                      <input type="tel" value={formData.phone} placeholder="Nomor Telepon" onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: "100%", border: "none", background: "transparent", padding: "8px", fontSize: 13, color: "#333", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Nama</label>
                    <div style={{ border: "1px solid #E4E4E7", borderRadius: 6, background: "white", padding: "1px 3px" }}>
                      <input type="text" value={formData.name} placeholder="Nama" onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: "100%", border: "none", background: "transparent", padding: "8px", fontSize: 13, color: "#333", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                </div>

                {/* Kanan: affiliate */}
                <div className="form-col" style={{ display: "flex", flexDirection: "column", gap: 7, width: "53%" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#333" }}>
                    Ajak Teman, Dapat <strong>Cashback 25%</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "stretch", height: 94, borderRadius: 8, border: "2px solid #FDC10E", background: "#FED65E", overflow: "hidden", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, padding: "0 0 0 16px", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#333" }}>Kode Affiliatemu</span>
                      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: "42px", color: "#333" }}>{affiliateCode}</span>
                    </div>
                    <button onClick={handleCopy} className="affiliate-copy-btn"
                      style={{ width: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#FDC10E", border: "none", borderLeft: "2px solid #E1A902", cursor: "pointer" }}>
                      {copied
                        ? <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M20 6L9 17l-5-5" stroke="#121926" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5M11 9H20C21.1046 9 22 9.89543 22 11V20C22 21.1046 21.1046 22 20 22H11C9.89543 22 9 21.1046 9 20V11C9 9.89543 9.89543 9 11 9Z" stroke="#121926" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      }
                    </button>
                  </div>
                  <div className="referral-row" style={{ display: "flex", gap: 12 }}>
                    {/* Referral Terdaftar */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, width: 110, padding: "14px 12px", borderRadius: 8, border: "2px solid #D9EFFA", background: "#F4FAFF", flexShrink: 0, boxSizing: "border-box" }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>000</span>
                      <span style={{ fontSize: 9, fontWeight: 500, color: "#333", whiteSpace: "nowrap" }}>Referral<br />Terdaftar</span>
                    </div>
                    {/* Terms and Conditions */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, padding: "12px 14px", borderRadius: 10, border: "1px solid #F4FAFF", background: "white" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#333" }}>Terms and Conditions</span>
                      <ul style={{ fontSize: 10, lineHeight: "15px", color: "#333", margin: 0, paddingLeft: 14 }}>
                        <li>Cashback 25% berlaku untuk pembelian paket oleh teman (pengguna baru).</li>
                        <li>Saldo akan masuk setelah transaksi teman terverifikasi.</li>
                        <li>Habitutor berhak membatalkan reward jika ditemukan indikasi kecurangan.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Customize */}
            {tab === "customize" && (
              <div className="customize-row" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                {/* Kiri: fields */}
                <div className="customize-fields" style={{ display: "flex", flexDirection: "column", gap: 16, width: "38%", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Pilih Kampus Impianmu</label>
                    <div style={{ border: "1px solid #E4E4E7", borderRadius: 6, background: "white", padding: "1px 3px" }}>
                      <input type="text" value={customize.kampus} placeholder="Kampus"
                        onChange={(e) => setCustomize({ ...customize, kampus: e.target.value })}
                        style={{ width: "100%", border: "none", background: "transparent", padding: "8px", fontSize: 13, color: "#333", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Pilih Jurusan Impianmu</label>
                    <div style={{ border: "1px solid #E4E4E7", borderRadius: 6, background: "white", padding: "1px 3px" }}>
                      <input type="text" value={customize.jurusan} placeholder="Jurusan"
                        onChange={(e) => setCustomize({ ...customize, jurusan: e.target.value })}
                        style={{ width: "100%", border: "none", background: "transparent", padding: "8px", fontSize: 13, color: "#333", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                </div>

                {/* Kanan: avatar grid */}
                <div className="customize-avatars" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>Pilih Avatarmu</label>
                  <div className="avatar-scroll-mobile" style={{ display: "none", overflowX: "auto", paddingBottom: 8, gap: 10 }}>
                    {AVATARS.map((av) => (
                      <AvatarItem key={av.id} av={av} selected={selectedAvatar === av.id} onSelect={setSelectedAvatar} size={80} />
                    ))}
                  </div>
                  <div className="avatar-grid-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                    {AVATARS.map((av) => (
                      <AvatarItem key={av.id} av={av} selected={selectedAvatar === av.id} onSelect={setSelectedAvatar} size={76} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Changes */}
          <div className="save-wrap" style={{ width: "100%", paddingLeft: 54, paddingRight: 54, boxSizing: "border-box", alignSelf: "stretch" }}>
            <SaveRow onSave={handleSave} />
          </div>
        </main>
      </div>
    </>
  );
}