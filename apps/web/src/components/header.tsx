import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/latihan-soal", label: "Latihan Soal" },
  ] as const;

  return (
    <div className="-translate-x-1/2 fixed top-4 left-1/2 flex flex-row items-center justify-between gap-8 rounded-lg border border-accent bg-background/50 p-2 backdrop-blur-lg">
      <nav className="flex gap-2 text-lg">
        {links.map(({ to, label }) => {
          return (
            <Button key={to} variant={"link"} asChild>
              <Link to={to}>{label}</Link>
            </Button>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </div>
  );
}
