import { StudentIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/kelas", label: "Kelas" },
		{ to: "/latihan-soal", label: "Latihan Soal" },
	] as const;
  const session = authClient.useSession();

  return (
    <div className="fixed inset-x-0 top-0 flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-accent border-b-2 bg-white px-6 backdrop-blur-lg md:px-8">
      <Link to="/" className="text-primary">
        Habitutor
      </Link>
      <div className="flex items-center gap-2">
        {session.data?.user ? (
          <Button asChild>
            <Link to="/dashboard">
              <StudentIcon />
              Dashboard
            </Link>
          </Button>
        ) : (
          <>
            <Button variant={"outline"} asChild>
              <Link to="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Daftar</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
