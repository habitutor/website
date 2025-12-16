import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import {
	ArrowClockwiseIcon,
	ArrowCounterClockwiseIcon,
	ImageIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	TextBIcon,
	TextHOneIcon,
	TextHThreeIcon,
	TextHTwoIcon,
	TextItalicIcon,
	TextStrikethroughIcon,
	TextUnderlineIcon,
	YoutubeLogoIcon,
} from "@phosphor-icons/react";
import {
	$createParagraphNode,
	$getSelection,
	$insertNodes,
	$isRangeSelection,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { $createImageNode } from "../nodes/image-node";
import { $createVideoNode } from "../nodes/video-node";

const LowPriority = 1;

interface ToolbarPluginProps {
	showImageInsert?: boolean;
	showVideoInsert?: boolean;
}

export function ToolbarPlugin({
	showImageInsert = true,
	showVideoInsert = true,
}: ToolbarPluginProps) {
	const [editor] = useLexicalComposerContext();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsStrikethrough(selection.hasFormat("strikethrough"));
		}
	}, []);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateToolbar();
					return false;
				},
				LowPriority,
			),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				LowPriority,
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				LowPriority,
			),
		);
	}, [editor, $updateToolbar]);

	const formatHeading = (headingSize: HeadingTagType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createHeadingNode(headingSize));
			}
		});
	};

	const formatParagraph = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createParagraphNode());
			}
		});
	};

	const insertImage = () => {
		const url = window.prompt("Enter image URL:");
		if (url) {
			const altText = window.prompt("Enter alt text (optional):") || "";
			editor.update(() => {
				const imageNode = $createImageNode({ src: url, altText });
				$insertNodes([imageNode]);
			});
		}
	};

	const insertVideo = () => {
		const url = window.prompt("Enter video URL (YouTube or Vimeo):");
		if (url) {
			editor.update(() => {
				const videoNode = $createVideoNode({ src: url });
				$insertNodes([videoNode]);
			});
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-1 rounded-t-lg border-border border-b bg-muted/50 p-2">
			{/* Undo/Redo */}
			<ToolbarButton
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
				disabled={!canUndo}
				title="Undo"
			>
				<ArrowCounterClockwiseIcon size={18} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
				disabled={!canRedo}
				title="Redo"
			>
				<ArrowClockwiseIcon size={18} />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Headings */}
			<ToolbarButton onClick={() => formatParagraph()} title="Normal text">
				<span className="font-medium text-sm">P</span>
			</ToolbarButton>
			<ToolbarButton onClick={() => formatHeading("h1")} title="Heading 1">
				<TextHOneIcon size={18} weight="bold" />
			</ToolbarButton>
			<ToolbarButton onClick={() => formatHeading("h2")} title="Heading 2">
				<TextHTwoIcon size={18} weight="bold" />
			</ToolbarButton>
			<ToolbarButton onClick={() => formatHeading("h3")} title="Heading 3">
				<TextHThreeIcon size={18} weight="bold" />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Text Formatting */}
			<ToolbarButton
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
				active={isBold}
				title="Bold"
			>
				<TextBIcon size={18} weight={isBold ? "bold" : "regular"} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
				active={isItalic}
				title="Italic"
			>
				<TextItalicIcon size={18} weight={isItalic ? "bold" : "regular"} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
				active={isUnderline}
				title="Underline"
			>
				<TextUnderlineIcon size={18} weight={isUnderline ? "bold" : "regular"} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() =>
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
				}
				active={isStrikethrough}
				title="Strikethrough"
			>
				<TextStrikethroughIcon
					size={18}
					weight={isStrikethrough ? "bold" : "regular"}
				/>
			</ToolbarButton>

			<ToolbarDivider />

			{/* Lists */}
			<ToolbarButton
				onClick={() =>
					editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
				}
				title="Bullet List"
			>
				<ListBulletsIcon size={18} />
			</ToolbarButton>
			<ToolbarButton
				onClick={() =>
					editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
				}
				title="Numbered List"
			>
				<ListNumbersIcon size={18} />
			</ToolbarButton>

			{(showImageInsert || showVideoInsert) && <ToolbarDivider />}

			{/* Media Insert */}
			{showImageInsert && (
				<ToolbarButton onClick={insertImage} title="Insert Image">
					<ImageIcon size={18} />
				</ToolbarButton>
			)}
			{showVideoInsert && (
				<ToolbarButton onClick={insertVideo} title="Insert Video">
					<YoutubeLogoIcon size={18} />
				</ToolbarButton>
			)}
		</div>
	);
}

interface ToolbarButtonProps {
	onClick: () => void;
	disabled?: boolean;
	active?: boolean;
	title?: string;
	children: React.ReactNode;
}

function ToolbarButton({
	onClick,
	disabled,
	active,
	title,
	children,
}: ToolbarButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={`flex items-center justify-center gap-0.5 rounded p-1.5 transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-accent text-accent-foreground" : ""}
      `}
		>
			{children}
		</button>
	);
}

function ToolbarDivider() {
	return <div className="mx-1 h-6 w-px bg-border" />;
}
