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

export type VideoSource = "youtube" | "vimeo" | "custom";

export interface VideoPayload {
	key?: NodeKey;
	src: string;
	videoId?: string;
	source?: VideoSource;
}

export type SerializedVideoNode = Spread<
	{
		src: string;
		videoId?: string;
		source?: VideoSource;
	},
	SerializedLexicalNode
>;

// Extract video ID from various URL formats
function extractVideoInfo(
	url: string,
): { videoId: string; source: VideoSource } | null {
	// YouTube patterns
	const youtubePatterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
		/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
	];

	for (const pattern of youtubePatterns) {
		const match = url.match(pattern);
		if (match) {
			return { videoId: match[1], source: "youtube" };
		}
	}

	// Vimeo patterns
	const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
	const vimeoMatch = url.match(vimeoPattern);
	if (vimeoMatch) {
		return { videoId: vimeoMatch[1], source: "vimeo" };
	}

	return null;
}

function convertVideoElement(domNode: Node): null | DOMConversionOutput {
	const iframe = domNode as HTMLIFrameElement;
	const src = iframe.getAttribute("src") || "";
	const videoInfo = extractVideoInfo(src);

	if (videoInfo) {
		const node = $createVideoNode({
			src,
			videoId: videoInfo.videoId,
			source: videoInfo.source,
		});
		return { node };
	}

	return null;
}

export class VideoNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__videoId: string | undefined;
	__source: VideoSource;

	static getType(): string {
		return "video";
	}

	static clone(node: VideoNode): VideoNode {
		return new VideoNode(node.__src, node.__videoId, node.__source, node.__key);
	}

	static importJSON(serializedNode: SerializedVideoNode): VideoNode {
		const { src, videoId, source } = serializedNode;
		return $createVideoNode({
			src,
			videoId,
			source,
		});
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("iframe");
		element.setAttribute("src", this.getEmbedUrl());
		element.setAttribute("frameborder", "0");
		element.setAttribute("allowfullscreen", "true");
		element.setAttribute(
			"allow",
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
		);
		element.style.width = "100%";
		element.style.aspectRatio = "16/9";
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			iframe: () => ({
				conversion: convertVideoElement,
				priority: 0,
			}),
		};
	}

	constructor(
		src: string,
		videoId?: string,
		source?: VideoSource,
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;

		// Auto-extract video info if not provided
		if (!videoId || !source) {
			const info = extractVideoInfo(src);
			this.__videoId = info?.videoId;
			this.__source = info?.source || "custom";
		} else {
			this.__videoId = videoId;
			this.__source = source;
		}
	}

	exportJSON(): SerializedVideoNode {
		return {
			src: this.__src,
			videoId: this.__videoId,
			source: this.__source,
			type: "video",
			version: 1,
		};
	}

	createDOM(config: EditorConfig): HTMLElement {
		const div = document.createElement("div");
		const theme = config.theme;
		const className = theme.video;
		if (className !== undefined) {
			div.className = className;
		}
		return div;
	}

	updateDOM(): false {
		return false;
	}

	getSrc(): string {
		return this.__src;
	}

	getVideoId(): string | undefined {
		return this.__videoId;
	}

	getSource(): VideoSource {
		return this.__source;
	}

	getEmbedUrl(): string {
		if (this.__source === "youtube" && this.__videoId) {
			return `https://www.youtube.com/embed/${this.__videoId}`;
		}
		if (this.__source === "vimeo" && this.__videoId) {
			return `https://player.vimeo.com/video/${this.__videoId}`;
		}
		return this.__src;
	}

	decorate(): JSX.Element {
		return (
			<VideoComponent
				src={this.__src}
				videoId={this.__videoId}
				source={this.__source}
				nodeKey={this.getKey()}
				embedUrl={this.getEmbedUrl()}
			/>
		);
	}
}

export function $createVideoNode({
	key,
	src,
	videoId,
	source,
}: VideoPayload): VideoNode {
	return $applyNodeReplacement(new VideoNode(src, videoId, source, key));
}

export function $isVideoNode(
	node: LexicalNode | null | undefined,
): node is VideoNode {
	return node instanceof VideoNode;
}

// Video Component for rendering
interface VideoComponentProps {
	src: string;
	videoId?: string;
	source: VideoSource;
	nodeKey: NodeKey;
	embedUrl: string;
}

function VideoComponent({
	embedUrl,
	source,
}: VideoComponentProps): JSX.Element {
	return (
		<div className="relative my-4 w-full" style={{ aspectRatio: "16/9" }}>
			<iframe
				src={embedUrl}
				className="absolute inset-0 h-full w-full rounded-lg"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				title={`${source} video`}
			/>
		</div>
	);
}
