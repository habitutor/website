import { type } from "arktype";
import { Snap } from "midtrans-client";
import { authed } from "..";

const snap = new Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY || "",
	clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const create = authed
	.route({
		path: "/transactions",
		method: "POST",
		tags: ["Payment"],
	})
	.input(type("number"))
	.output(
		type({
			token: "string",
			redirectUrl: "string",
		}),
	)
	.handler(async ({ input, context }) => {
		const params = {
			transaction_details: {
				order_id: String(input),
				gross_amount: 1,
			},
			customer_details: {
				first_name: context.session.user.name,
				email: context.session.user.email,
			},
			credit_card: { secure: true },
		};

		const transaction = await snap.createTransaction(params);

		return {
			token: transaction.token,
			redirectUrl: transaction.redirect_url,
		};
	});

export const transactionRouter = {
	create,
};
