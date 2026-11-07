import { FAQ as SunriseFAQ } from "@/routes/-home/faq";

export function FAQ({ className }: { className?: string }) {
  return (
    <SunriseFAQ
      className={className}
      title={
        <>
          Masih <span className="font-sr-serif text-sr-blue-600 italic">Ragu?</span>
        </>
      }
      description="Jawaban cepat buat pertanyaan yang paling sering masuk"
    />
  );
}
