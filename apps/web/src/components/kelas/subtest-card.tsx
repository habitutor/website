import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BodyOutputs } from "@/utils/orpc";
import { buttonVariants } from "../ui/button";

type SubtestListItem = NonNullable<
	BodyOutputs["admin"]["subtest"]["listSubtests"]
>[number];
type SubtestDetail = BodyOutputs["subtest"]["find"];

export function SubtestCard({
	subtest,
	path,
}: {
	subtest: SubtestListItem | SubtestDetail;
	path: string;
}) {
	const routePath = path === "/classes" ? "/classes/$id" : "/subtests/$id";

	return (
		<Card className="p-4 transition-colors">
			<div className="flex h-full justify-between">
				<div className="flex-1">
					<h3 className="font-medium">{subtest?.name}</h3>
				</div>
				<Link
					to={routePath}
					params={{ id: subtest?.id }}
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
            "mt-auto mb-0 hover:bg-muted/50"
					)}
				>
					<PencilSimpleIcon size={18} />
				</Link>
			</div>
		</Card>
	);
}
