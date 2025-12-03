import { GoogleChromeLogoIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center pt-24">
			<SignUpForm />
		</main>
	)
}

function SignUpForm() {
	const navigate = useNavigate({
		from: "/",
	})
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						})
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			)
		},
		validators: {
			onSubmit: type({
				name: "string >= 2",
				email: "string.email",
				password: "string >= 8",
			}),
		},
	})

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full max-w-md">
			<div className="w-full rounded-sm border border-primary/50 bg-white p-8 shadow-lg">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-3xl text-primary">
						<span className="font-bold">Buat Akun </span>
						Baru
					</h1>
					<p className="text-sm">Daftar untuk mulai belajar sekarang!</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="mt-8 space-y-4"
				>
					<div>
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Nama Lengkap</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div>
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div>
						<form.Field name="password">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										name={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-red-500">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Memuat..." : "Daftar"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<Button variant="outline" className="mt-4 w-full">
					<GoogleChromeLogoIcon />
					Daftar dengan Google
				</Button>
			</div>

			<p className="mt-4 text-center text-sm">
				Sudah punya akun?{" "}
				<Link to="/login" className="font-bold text-primary">
					Masuk Sekarang
				</Link>
			</p>
		</div>
	)
}
