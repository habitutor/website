import { GoogleLogoIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center pt-24">
			<SignInForm />
		</main>
	);
}

function SignInForm() {
	const navigate = useNavigate({
		from: "/",
	});
	const location = useLocation();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: async () => {
						const session = await authClient.getSession();
						const user = session.data?.user as { role?: string } | undefined;

						if (user?.role === "admin") {
							navigate({ to: "/admin/dashboard" });
						} else {
							navigate({ to: "/dashboard" });
						}
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: type({
				email: "string.email",
				password: "string",
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full max-w-md">
			<div className="w-full rounded-sm border border-primary/50 bg-white p-8 shadow-lg">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-3xl text-primary">
						<span className="font-bold">Selamat Datang </span>
						Kembali
					</h1>
					<p className="text-sm">Masuk kembali untuk memulai belajar lagi!</p>
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
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										name={field.name}
										type="email"
										autoFocus
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
						<Link to="/forgot-password" className="ml-auto w-fit text-primary text-xs underline">
							Lupa Password?
						</Link>
					</div>

					<form.Subscribe>
						{(state) => (
							<Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
								{state.isSubmitting ? "Memuat..." : "Masuk"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<Button
					onClick={() => {
						authClient.signIn.social({
							provider: "google",
							callbackURL: `${location.url}/dashboard`,
						});
					}}
					variant="outline"
					className="mt-4 w-full"
				>
					<GoogleLogoIcon weight="bold" />
					Masuk dengan Google
				</Button>
			</div>

			<p className="mt-4 text-center text-sm">
				Belum punya akun?{" "}
				<Link to="/register" className="font-bold text-primary">
					Daftar Sekarang
				</Link>
			</p>
		</div>
	);
}
