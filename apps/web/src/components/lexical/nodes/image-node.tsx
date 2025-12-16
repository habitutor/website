import type {
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import type { JSX } from "react";

export interface ImagePayload {
	altText: string;
	height?: number;
	key?: NodeKey;
	src: string;
	width?: number;
}

export type SerializedImageNode = Spread<
	{
		altText: string;
		height?: number;
		src: string;
		width?: number;
	},
	SerializedLexicalNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
	const img = domNode as HTMLImageElement;
	if (img.src.startsWith("file:///")) {
		return null;
	}
	const { alt: altText, src, width, height } = img;
	const node = $createImageNode({ altText, height, src, width });
	return { node };
}

export class ImageNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__altText: string;
	__width: number | undefined;
	__height: number | undefined;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__src,
			node.__altText,
			node.__width,
			node.__height,
			node.__key,
		);
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		const { altText, height, width, src } = serializedNode;
		const node = $createImageNode({
			altText,
			height,
			src,
			width,
		});
		return node;
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("img");
		element.setAttribute("src", this.__src);
		element.setAttribute("alt", this.__altText);
		if (this.__width) {
			element.setAttribute("width", this.__width.toString());
		}
		if (this.__height) {
			element.setAttribute("height", this.__height.toString());
		}
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: () => ({
				conversion: convertImageElement,
				priority: 0,
			}),
		};
	}

	constructor(
		src: string,
		altText: string,
		width?: number,
		height?: number,
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__width = width;
		this.__height = height;
	}

	exportJSON(): SerializedImageNode {
		return {
			altText: this.getAltText(),
			height: this.__height,
			src: this.getSrc(),
			type: "image",
			version: 1,
			width: this.__width,
		};
	}

	setWidthAndHeight(width: number, height: number): void {
		const writable = this.getWritable();
		writable.__width = width;
		writable.__height = height;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		const theme = config.theme;
		const className = theme.image;
		if (className !== undefined) {
			span.className = className;
		}
		return span;
	}

	updateDOM(): false {
		return false;
	}

	getSrc(): string {
		return this.__src;
	}

	getAltText(): string {
		return this.__altText;
	}

	decorate(): JSX.Element {
		return (
			<ImageComponent
				src={this.__src}
				altText={this.__altText}
				width={this.__width}
				height={this.__height}
				nodeKey={this.getKey()}
			/>
		);
	}
}

export function $createImageNode({
	altText,
	height,
	key,
	src,
	width,
}: ImagePayload): ImageNode {
	return $applyNodeReplacement(new ImageNode(src, altText, width, height, key));
}

export function $isImageNode(
	node: LexicalNode | null | undefined,
): node is ImageNode {
	return node instanceof ImageNode;
}

// Image Component for rendering
interface ImageComponentProps {
	src: string;
	altText: string;
	width?: number;
	height?: number;
	nodeKey: NodeKey;
}

function ImageComponent({
	src,
	altText,
	width,
	height,
}: ImageComponentProps): JSX.Element {
	return (
		<img
			src={src}
			alt={altText}
			style={{
				maxWidth: "100%",
				height: "auto",
				...(width ? { width } : {}),
				...(height ? { height } : {}),
			}}
			className="my-4 rounded-lg"
			draggable="false"
		/>
	);
}
