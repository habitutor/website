import { Image } from "@unpic/react";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-primary-300 *:text-white">
      <Container className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:py-12">
        <div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Image
              src={"/logo.svg"}
              alt="Logo Habitutor"
              layout="fullWidth"
              className="pointer-events-none select-none -ml-2.5"
            />
            <h3 className="font-medium text-2xl">Habitutor</h3>
          </div>
          <p className="text-center sm:text-left">
            Ubah Persiapan Ujian Menjadi Investasi Masa Depan
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-end justify-end gap-4 mt-6 sm:mt-0">
          <div className="flex items-center gap-2">
            {DATA.footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "white", size: "icon" }),
                )}
              >
                <social.icon className="size-6" weight="bold" />
              </a>
            ))}
          </div>
          <div className=" flex items-center gap-2 text-sm md:text-base">
            Built Together With{" "}
            <a
              href="https://www.instagram.com/omahti_ugm"
              className="flex items-center gap-2 hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/icons/OmahTI.webp"
                alt="OmahTI"
                width={111}
                height={15}
                sizes="60%"
                className="h-2.5 w-auto md:h-3"
              />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
