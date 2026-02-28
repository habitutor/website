export function convertToTiptap(text: string) {
	try {
		const parsed = JSON.parse(text);
		if (parsed && parsed.type === "doc") return parsed;
	} catch {}

	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [{ type: "text", text }],
			},
		],
	};
}

export function escapeLikePattern(value: string): string {
	return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
