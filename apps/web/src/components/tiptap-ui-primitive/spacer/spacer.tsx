export type SpacerOrientation = "horizontal" | "vertical";

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: SpacerOrientation;
	size?: string | number;
}

const EMPTY_STYLE = {} as const;

export function Spacer({ orientation = "horizontal", size, style = EMPTY_STYLE, ...props }: SpacerProps) {
	const computedStyle = {
		...style,
		...(orientation === "horizontal" && !size && { flex: 1 }),
		...(size && {
			width: orientation === "vertical" ? "1px" : size,
			height: orientation === "horizontal" ? "1px" : size,
		}),
	};

	return <div {...props} style={computedStyle} />;
}
