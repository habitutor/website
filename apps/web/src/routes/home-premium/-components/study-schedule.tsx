const INSTAGRAM_POST_EMBED_URL = "https://www.instagram.com/p/DbxGncHD5CT/embed/";

export function StudySchedule() {
  return (
    <section className="bg-neutral-100">
      <div className="container mx-auto flex w-full max-w-xl flex-col items-center justify-start gap-8 px-4 py-16">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Jadwal <span className="text-primary-300">Belajar</span>
          </h2>
          <p className="font-semibold text-neutral-700">Jadwal belajar 150+ live class</p>
        </div>

        <iframe
          src={INSTAGRAM_POST_EMBED_URL}
          title="Jadwal Belajar Habitutor di Instagram"
          loading="lazy"
          allowTransparency
          className="h-[640px] w-full max-w-[540px] rounded-2xl border-2 border-neutral-300 bg-white shadow-sm"
        />
      </div>
    </section>
  );
}
