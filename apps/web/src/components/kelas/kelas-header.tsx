export function KelasHeader({ path }: { path: string }) {
	const title =
		path === "/classes" ? "Kelas-Kelas UTBK" : "Subtest-Subtest UTBK";
	const description =
		path === "/classes"
			? "Pilih kelas-kelas UTBK yang ingin kamu pelajari"
			: "Pilih subtest-subtest UTBK yang ingin kamu pelajari";

	return (
		<div className="flex min-h-40 flex-col items-center justify-center bg-amber-300">
			<h1 className="font-bold text-2xl">{title}</h1>
			<p className="text-gray-500 text-sm">{description}</p>
		</div>
	);
}
