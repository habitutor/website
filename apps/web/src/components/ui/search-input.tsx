import { XIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
	value: string;
	onChange: (value: string) => void;
	debounceMs?: number;
}

export function SearchInput({ value, onChange, debounceMs = 500, className, ...props }: SearchInputProps) {
	const [localValue, setLocalValue] = useState(value);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			onChange(newValue);
		}, debounceMs);
	};

	const handleClear = () => {
		setLocalValue("");
		onChange("");
	};

	const displayValue = value !== undefined ? value : localValue;

	return (
		<div className="relative">
			<input
				type="text"
				value={displayValue}
				onChange={handleChange}
				className={cn(
					"flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 pr-10 text-sm shadow-sm transition-colors",
					"placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					"disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
				placeholder={props.placeholder ?? "Cari konten..."}
			/>
			{displayValue && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
				>
					<XIcon className="size-4" weight="bold" />
				</button>
			)}
		</div>
	);
}
