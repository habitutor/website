export const requireAdmin = o.middleware(async ({ context, next }) => {
	if (context.session?.user.role !== "admin")
		throw new ORPCError("UNAUTHORIZED");

	return next();
});
