import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";

export default function Footer() {
  return (
    <footer className="bg-primary-300 *:text-white">
      <Container className="flex-row items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src={"/logo.svg"}
              alt="Logo Habitutor"
              layout="fullWidth"
              className="pointer-events-none select-none"
            />
            <h3 className="font-medium text-2xl">Habitutor</h3>
          </div>
          <p>Ubah Persiapan Ujian Menjadi Investasi Masa Depan</p>
        </div>
        <div className="flex flex-col items-end justify-end">
          <div className="flex items-center gap-2">
            {DATA.footer.socials.map((social) => (
              <Link key={social.label} to={social.url}>
                <social.icon />
              </Link>
            ))}
          </div>
          <p>
            Built Together With <Link to="/">Habitutor</Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
