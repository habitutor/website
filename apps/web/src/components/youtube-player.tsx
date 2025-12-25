import YouTube from "react-youtube";

export default function YouTubePlayer({ videoId }: { videoId: string }) {
	const opts = {
		width: "100%",
		playerVars: {
			autoplay: 0,
			controls: 0,
			modestbranding: 0,
			rel: 0,
		},
	};

	return (
		<div>
			<YouTube videoId={videoId} opts={opts} iframeClassName="w-full h-full aspect-video rounded-xl" />
		</div>
	);
}
