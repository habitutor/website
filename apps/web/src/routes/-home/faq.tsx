import { useState } from "react";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";
import { DATA } from "./data";

export function FAQ() {
	const [openIds, setOpenIds] = useState<Set<number>>(new Set());

	const toggleAccordion = (id: number) => {
		const newOpenIds = new Set(openIds);
		if (newOpenIds.has(id)) {
			newOpenIds.delete(id);
		} else {
			newOpenIds.add(id);
		}
		setOpenIds(newOpenIds);
	};

	return (
		<section className="mx-auto flex w-full max-w-5xl flex-col items-center justify-start gap-8 px-4 py-16">
			<div className="space-y-2 text-center *:text-pretty">
				<h2 className="font-bold text-2xl sm:text-3xl">
					Punya Pertanyaan? <span className="text-primary-300">Kami Siap Bantu</span>
				</h2>
				<p className="text-pretty font-medium text-sm md:text-base">
					Cari jawaban cepat tentang fitur, kelas, dan pengalaman belajar
				</p>
			</div>

			<div className="w-full space-y-3">
				{DATA.faq.map((item) => (
					<div key={item.id} className="rounded-lg flex flex-col items-center">
						<button
							onClick={() => toggleAccordion(item.id)}
							className={`flex w-full rounded-lg border shadow-sm items-center justify-between gap-4 px-4 py-4 text-left transition-colors ${
								openIds.has(item.id) ? "bg-[#FFFCF3]" : "hover:bg-gray-50"
							}`}
						>
							<h3 className="font-semibold text-gray-900">{item.question}</h3>
							<div className="shrink-0 text-primary-500 flex justify-center">
								{openIds.has(item.id) ? (
									<MinusIcon size={20} weight="bold" />
								) : (
									<PlusIcon size={20} weight="bold" />
								)}
							</div>
						</button>

						{openIds.has(item.id) && (
							<div className="rounded-b-lg shadow-sm border border-[#FEEAAE] bg-[#FFF5D7] flex px-4 py-4 w-[98%]">
								<p className="text-sm text-gray-600">{item.answer}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}