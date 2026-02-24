import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FeatureRow {
	name: string;
	free: boolean | string;
	premium: boolean | string;
}

const features: FeatureRow[] = [
	{ name: "Akses materi latihan", free: "Terbatas", premium: "Semua subtest" },
	{ name: "Tips & trik eksklusif", free: false, premium: true },
	{ name: "Komunitas premium (Discord & WhatsApp)", free: false, premium: true },
	{ name: "Latihan soal", free: "Terbatas", premium: "Semua latihan soal" },
	{ name: "Brain Gym", free: "1x Sehari", premium: "Tidak Terbatas" },
	{ name: "Progress tracking", free: true, premium: true },
];

function FeatureValue({ value, isPremium }: { value: boolean | string; isPremium: boolean }) {
	if (typeof value === "boolean") {
		return value ? (
			<CheckIcon
				size={20}
				className={cn("mx-auto", isPremium ? "text-primary-500" : "text-neutral-400")}
				weight="bold"
			/>
		) : (
			<XIcon size={20} className="mx-auto text-neutral-300" />
		);
	}
	return <span className={cn(isPremium && "font-medium text-primary-600")}>{value}</span>;
}

export function FeatureComparisonTable() {
	return (
		<div className="overflow-x-auto rounded-[10px] border border-neutral-200">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-neutral-200 border-b bg-neutral-50">
						<th className="px-4 py-3 text-left font-medium text-neutral-1000">Fitur</th>
						<th className="px-4 py-3 text-center font-medium text-neutral-600">Gratis</th>
						<th className="px-4 py-3 text-center font-medium text-primary-500">Premium</th>
					</tr>
				</thead>
				<tbody>
					{features.map((feature, index) => (
						<tr key={feature.name} className={index < features.length - 1 ? "border-neutral-200 border-b" : ""}>
							<td className="px-4 py-3 text-neutral-700">{feature.name}</td>
							<td className="px-4 py-3 text-center text-neutral-500">
								<FeatureValue value={feature.free} isPremium={false} />
							</td>
							<td className="px-4 py-3 text-center">
								<FeatureValue value={feature.premium} isPremium />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
