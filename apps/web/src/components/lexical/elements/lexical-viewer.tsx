import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useEffect } from "react";
import { ImageNode } from "../nodes/image-node";
import { VideoNode } from "../nodes/video-node";

// Check if content is valid Lexical JSON
function isLexicalJSON(content: string): boolean {
	try {
		const parsed = JSON.parse(content);
		return parsed && typeof parsed === "object" && "root" in parsed;
	} catch {
		return false;
	}
}

// Convert simple Markdown to Lexical JSON (basic support)
function markdownToLexicalJSON(markdown: string): string {
	const lines = markdown.split("\n");
	const children: unknown[] = [];

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];

		// Skip empty lines
		if (!line.trim()) {
			i++;
			continue;
		}

		// Heading detection
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const text = headingMatch[2];
			children.push({
				type: "heading",
				tag: `h${level}`,
				children: [{ type: "text", text: parseInlineFormatting(text) }],
				direction: "ltr",
				format: "",
				indent: 0,
				version: 1,
			});
			i++;
			continue;
		}

		// Unordered list detection
		if (line.match(/^[-*]\s+/)) {
			const listItems: unknown[] = [];
			while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
				const itemText = lines[i].replace(/^[-*]\s+/, "");
				listItems.push({
					type: "listitem",
					value: listItems.length + 1,
					children: [
						{
							type: "paragraph",
							children: [
								{ type: "text", text: parseInlineFormatting(itemText) },
							],
							direction: "ltr",
							format: "",
							indent: 0,
							version: 1,
						},
					],
					direction: "ltr",
					format: "",
					indent: 0,
					version: 1,
				});
				i++;
			}
			children.push({
				type: "list",
				listType: "bullet",
				start: 1,
				tag: "ul",
				children: listItems,
				direction: "ltr",
				format: "",
				indent: 0,
				version: 1,
			});
			continue;
		}

		// Ordered list detection
		if (line.match(/^\d+\.\s+/)) {
			const listItems: unknown[] = [];
			while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
				const itemText = lines[i].replace(/^\d+\.\s+/, "");
				listItems.push({
					type: "listitem",
					value: listItems.length + 1,
					children: [
						{
							type: "paragraph",
							children: [
								{ type: "text", text: parseInlineFormatting(itemText) },
							],
							direction: "ltr",
							format: "",
							indent: 0,
							version: 1,
						},
					],
					direction: "ltr",
					format: "",
					indent: 0,
					version: 1,
				});
				i++;
			}
			children.push({
				type: "list",
				listType: "number",
				start: 1,
				tag: "ol",
				children: listItems,
				direction: "ltr",
				format: "",
				indent: 0,
				version: 1,
			});
			continue;
		}

		// Regular paragraph
		children.push({
			type: "paragraph",
			children: [{ type: "text", text: parseInlineFormatting(line) }],
			direction: "ltr",
			format: "",
			indent: 0,
			version: 1,
		});
		i++;
	}

	// If no content, add empty paragraph
	if (children.length === 0) {
		children.push({
			type: "paragraph",
			children: [],
			direction: "ltr",
			format: "",
			indent: 0,
			version: 1,
		});
	}

	return JSON.stringify({
		root: {
			type: "root",
			children,
			direction: "ltr",
			format: "",
			indent: 0,
			version: 1,
		},
	});
}

// Parse inline formatting (basic: **bold**, *italic*)
function parseInlineFormatting(text: string): string {
	// For simplicity, we'll just return plain text
	// More complex parsing would create multiple text nodes with formats
	return text
		.replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold markers
		.replace(/\*(.+?)\*/g, "$1") // Remove italic markers
		.replace(/__(.+?)__/g, "$1") // Remove bold markers
		.replace(/_(.+?)_/g, "$1"); // Remove italic markers
}

// Plugin to load initial content
function LoadContentPlugin({ content }: { content: string }) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!content) return;

		// Determine format and convert if needed
		const lexicalJSON = isLexicalJSON(content)
			? content
			: markdownToLexicalJSON(content);

		try {
			const editorState = editor.parseEditorState(lexicalJSON);
			editor.setEditorState(editorState);
		} catch (error) {
			console.error("Failed to parse content:", error);
			// Fallback: try to parse as markdown
			try {
				const fallbackJSON = markdownToLexicalJSON(content);
				const editorState = editor.parseEditorState(fallbackJSON);
				editor.setEditorState(editorState);
			} catch (fallbackError) {
				console.error("Fallback parsing also failed:", fallbackError);
			}
		}
	}, [editor, content]);

	return null;
}

interface LexicalViewerProps {
	content: string | null | undefined;
	className?: string;
}

export function LexicalViewer({ content, className = "" }: LexicalViewerProps) {
	if (!content) {
		return null;
	}

	const initialConfig = {
		namespace: "LexicalViewer",
		editable: false,
		onError: (error: Error) => {
			console.error("Lexical Viewer Error:", error);
		},
		nodes: [
			HeadingNode,
			QuoteNode,
			ListNode,
			ListItemNode,
			LinkNode,
			CodeNode,
			ImageNode,
			VideoNode,
		],
		theme: {
			paragraph: "mb-2",
			heading: {
				h1: "text-3xl font-bold",
				h2: "text-2xl font-bold",
				h3: "text-xl font-bold",
				h4: "text-lg font-bold",
				h5: "text-base font-bold",
				h6: "text-sm font-bold",
			},
			list: {
				ul: "list-disc list-inside mb-4 space-y-1",
				ol: "list-decimal list-inside mb-4 space-y-1",
				listitem: "ml-4",
			},
			quote: "border-l-4 border-border pl-4 italic my-4 text-muted-foreground",
			code: "bg-muted px-1.5 py-0.5 rounded font-mono text-sm",
			link: "text-primary underline hover:no-underline",
			text: {
				bold: "font-bold",
				italic: "italic",
				underline: "underline",
				strikethrough: "line-through",
			},
			image: "my-4",
			video: "my-4",
		},
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div className={`lexical-viewer ${className}`}>
				<RichTextPlugin
					contentEditable={
						<ContentEditable className="prose prose-sm dark:prose-invert max-w-none outline-none" />
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<LoadContentPlugin content={content} />
			</div>
		</LexicalComposer>
	);
}
