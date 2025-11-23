import type {
	DefaultError,
	UseMutationOptions,
	UseMutationResult,
} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

export function useDebouncedMutation<
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	delay = 1000,
): UseMutationResult<TData, TError, TVariables, TContext> & {
	debouncedMutate: (variables: TVariables) => void;
} {
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const mutation = useMutation(options);

	const debouncedMutate = useCallback(
		(variables: TVariables) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				mutation.mutate(variables);
			}, delay);
		},
		[mutation, delay],
	);

	return {
		...mutation,
		debouncedMutate,
	};
}
