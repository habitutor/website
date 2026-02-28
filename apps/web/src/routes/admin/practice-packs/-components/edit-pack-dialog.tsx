import { SpinnerIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

const formValidator = type({
	title: "string>0",
	"description?": "string",
});

type PracticePack = {
	id: number;
	title: string;
	description: string | null;
};

type EditPackDialogProps = {
	pack: PracticePack;
	trigger?: React.ReactNode;
};

export function EditPackDialog({ pack, trigger }: EditPackDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const updateMutation = useMutation(
		orpc.admin.practicePack.update.mutationOptions({
			onSuccess: () => {
				toast.success("Practice pack updated successfully");
				queryClient.invalidateQueries({
					queryKey: orpc.admin.practicePack.list.queryKey({ input: {} }),
				});
				queryClient.invalidateQueries(orpc.admin.practicePack.get.queryOptions({ input: { id: pack.id } }));
				setOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to update practice pack", {
					description: String(error),
				});
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			title: pack.title,
			description: pack.description || "",
		},
		onSubmit: async ({ value }) => {
			const validation = formValidator(value);
			if (validation instanceof type.errors) {
				toast.error("Please fill all required fields");
				return;
			}

			updateMutation.mutate({
				id: pack.id,
				title: value.title,
				description: value.description || undefined,
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Pack Information</DialogTitle>
					<DialogDescription>Update the title and description for this practice pack.</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="title">
						{(field) => (
							<div>
								<Label htmlFor="edit-title">Title *</Label>
								<Input
									id="edit-title"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Practice pack title"
									className="mt-2"
									autoFocus
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<div>
								<Label htmlFor="edit-description">Description</Label>
								<Textarea
									id="edit-description"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Optional description"
									className="mt-2"
								/>
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updateMutation.isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? (
								<>
									<SpinnerIcon className="animate-spin" />
									Saving…
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
