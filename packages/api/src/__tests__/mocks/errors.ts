import { ORPCError } from "@orpc/client";

type ErrorCode =
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "UNPROCESSABLE_CONTENT"
	| "INTERNAL_SERVER_ERROR"
	| "FORBIDDEN"
	| "TOO_MANY_REQUESTS";

const errorMessages: Record<ErrorCode, string> = {
	NOT_FOUND: "Gagal menemukan resource yang diminta.",
	UNAUTHORIZED: "Anda tidak memiliki akses ke resource ini.",
	UNPROCESSABLE_CONTENT: "Permintaan anda tidak dapat diproses.",
	INTERNAL_SERVER_ERROR: "Terjadi kesalahan pada sisi kami, silahkan coba lagi.",
	FORBIDDEN: "Anda tidak memiliki hak akses ke resource ini.",
	TOO_MANY_REQUESTS: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
};

function createError(code: ErrorCode, defaultMessage: string) {
	return (data?: { message?: string }) => {
		throw new ORPCError(code, { message: data?.message ?? defaultMessage });
	};
}

export function createMockErrors() {
	return {
		NOT_FOUND: createError("NOT_FOUND", errorMessages.NOT_FOUND),
		UNAUTHORIZED: createError("UNAUTHORIZED", errorMessages.UNAUTHORIZED),
		UNPROCESSABLE_CONTENT: createError("UNPROCESSABLE_CONTENT", errorMessages.UNPROCESSABLE_CONTENT),
		INTERNAL_SERVER_ERROR: createError("INTERNAL_SERVER_ERROR", errorMessages.INTERNAL_SERVER_ERROR),
		FORBIDDEN: createError("FORBIDDEN", errorMessages.FORBIDDEN),
		TOO_MANY_REQUESTS: createError("TOO_MANY_REQUESTS", errorMessages.TOO_MANY_REQUESTS),
	};
}
