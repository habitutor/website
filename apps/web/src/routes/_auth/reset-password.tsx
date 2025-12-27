import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { type } from "arktype";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const resetPasswordSearchSchema = type({
	email: "string.email?",
});

export const Route = createFileRoute("/_auth/reset-password")({
	component: RouteComponent,
	validateSearch: resetPasswordSearchSchema,
});

function RouteComponent() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_auth/reset-password" });

	const form = useForm({
		defaultValues: {
			email: search.email || "",
			otp: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.verifyOtp(
				{
					email: value.email,
					type: "forget-password",
					otp: value.otp,
				},
				{
					onSuccess: async () => {
						toast.success("Password berhasil direset");
						navigate({ to: "/login" });
					},
					onError: (err: unknown) => {
						console.error(err);
						toast.error("Kode OTP tidak valid");
					},
				},
			);
		},
		validators: {
			onSubmit: type({
				email: "string.email",
				otp: "string == 6",
			}),
		},
	});

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center pt-24">
			<div className="w-full max-w-md">
				<div className="w-full rounded-sm border border-primary/50 bg-white p-8 shadow-lg">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-3xl text-primary">
							<span className="font-bold">Reset Password</span>
						</h1>
						<p className="text-sm">Masukkan kode OTP yang dikirim ke email Anda</p>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="mt-8 space-y-4"
					>
						<form.Field name="email">
							{(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="email@contoh.com"
											autoComplete="email"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						</form.Field>

						<div className="space-y-2">
							<label htmlFor="otp-input" className="font-medium text-sm">
								Kode OTP
							</label>
							<div className="flex justify-center">
								<form.Field name="otp">
									{(field) => (
										<InputOTP
											id="otp-input"
											maxLength={6}
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
										>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									)}
								</form.Field>
							</div>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
									{state.isSubmitting ? "Memuat..." : "Verifikasi OTP"}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<Button variant="link" onClick={() => navigate({ to: "/forgot-password" })} className="mt-4 w-full">
						Kirim Ulang Kode OTP
					</Button>
				</div>

				<p className="mt-4 text-center text-sm">
					Ingat password?{" "}
					<button
						type="button"
						onClick={() => navigate({ to: "/login" })}
						className="font-bold text-primary hover:underline"
					>
						Masuk
					</button>
				</p>
			</div>
		</main>
	);
}
