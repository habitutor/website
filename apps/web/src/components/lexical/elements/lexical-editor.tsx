import { CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { ImageNode } from "../nodes/image-node";
import { VideoNode } from "../nodes/video-node";
import { ToolbarPlugin } from "../plugins/toolbar-plugin";

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
	return text
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(/\*(.+?)\*/g, "$1")
		.replace(/__(.+?)__/g, "$1")
		.replace(/_(.+?)_/g, "$1");
}

// Plugin to load initial content
function LoadContentPlugin({
	content,
	onLoaded,
}: {
	content: string;
	onLoaded?: () => void;
}) {
	const [editor] = useLexicalComposerContext();
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (isLoaded || !content) return;

		const lexicalJSON = isLexicalJSON(content)
			? content
			: markdownToLexicalJSON(content);

		try {
			const editorState = editor.parseEditorState(lexicalJSON);
			editor.setEditorState(editorState);
			setIsLoaded(true);
			onLoaded?.();
		} catch (error) {
			console.error("Failed to parse content:", error);
			try {
				const fallbackJSON = markdownToLexicalJSON(content);
				const editorState = editor.parseEditorState(fallbackJSON);
				editor.setEditorState(editorState);
				setIsLoaded(true);
				onLoaded?.();
			} catch (fallbackError) {
				console.error("Fallback parsing also failed:", fallbackError);
			}
		}
	}, [editor, content, isLoaded, onLoaded]);

	return null;
}

interface LexicalEditorProps {
	initialContent?: string | null;
	onChange?: (content: string) => void;
	onSave?: (content: string) => void;
	placeholder?: string;
	className?: string;
	showImageInsert?: boolean;
	showVideoInsert?: boolean;
}

export function LexicalEditor({
	initialContent,
	onChange,
	placeholder = "Start writing...",
	className = "",
	showImageInsert = true,
	showVideoInsert = true,
}: LexicalEditorProps) {
	const handleChange = useCallback(
		(editorState: EditorState) => {
			editorState.read(() => {
				const json = JSON.stringify(editorState.toJSON());
				onChange?.(json);
			});
		},
		[onChange],
	);

	const initialConfig = {
		namespace: "LexicalEditor",
		editable: true,
		onError: (error: Error) => {
			console.error("Lexical Editor Error:", error);
		},
		nodes: [
			HeadingNode,
			QuoteNode,
			ListNode,
			ListItemNode,
			LinkNode,
			AutoLinkNode,
			CodeNode,
			ImageNode,
			VideoNode,
		],
		theme: {
			paragraph: "mb-2",
			heading: {
				h1: "text-3xl font-bold mb-4 mt-6",
				h2: "text-2xl font-bold mb-3 mt-5",
				h3: "text-xl font-bold mb-2 mt-4",
				h4: "text-lg font-bold mb-2 mt-3",
				h5: "text-base font-bold mb-1 mt-2",
				h6: "text-sm font-bold mb-1 mt-2",
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
			<div
				className={`lexical-editor rounded-lg border border-border ${className}`}
			>
				<ToolbarPlugin
					showImageInsert={showImageInsert}
					showVideoInsert={showVideoInsert}
				/>
				<div className="relative">
					<RichTextPlugin
						contentEditable={
							<ContentEditable className="prose prose-sm dark:prose-invert min-h-[200px] max-w-none p-4 outline-none" />
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					{!initialContent && (
						<div className="pointer-events-none absolute top-4 left-4 text-muted-foreground">
							{placeholder}
						</div>
					)}
				</div>
				<HistoryPlugin />
				<ListPlugin />
				<LinkPlugin />
				<OnChangePlugin onChange={handleChange} />
				{initialContent && <LoadContentPlugin content={initialContent} />}
			</div>
		</LexicalComposer>
	);
}

// Hook to get editor content as JSON string
export function useEditorContent() {
	const [content, setContent] = useState<string>("");

	const handleChange = useCallback((newContent: string) => {
		setContent(newContent);
	}, []);

	return { content, handleChange };
}
