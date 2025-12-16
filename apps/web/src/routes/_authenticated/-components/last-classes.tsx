import { EmptyIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const LastClasses = () => {
  return (
    <section>
      <h2 className="font-medium">Kelas terakhirmu</h2>
      {/* empty placeholder for now */}
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <EmptyIcon />
          </EmptyMedia>
          <EmptyTitle>Belum ada riwayat</EmptyTitle>
          <EmptyDescription>Kamu belum membuka kelas. Buka kelas untuk memulai perjuangan masuk PTN-mu!</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/classes">Lihat kelas</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </section>
  );
};
