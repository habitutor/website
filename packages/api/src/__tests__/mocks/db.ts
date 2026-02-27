import { type Mock, mock } from "bun:test";

type MockQueryBuilder<T = unknown> = {
	select: Mock<() => MockQueryBuilder<T>>;
	from: Mock<() => MockQueryBuilder<T>>;
	where: Mock<() => MockQueryBuilder<T>>;
	orderBy: Mock<() => MockQueryBuilder<T>>;
	limit: Mock<() => MockQueryBuilder<T>>;
	offset: Mock<() => MockQueryBuilder<T>>;
	returning: Mock<() => Promise<T[]>>;
	values: Mock<() => Promise<T[]>>;
	set: Mock<() => MockQueryBuilder<T>>;
	execute: Mock<() => Promise<{ rows: T[] }>>;
	innerJoin: Mock<() => MockQueryBuilder<T>>;
	leftJoin: Mock<() => MockQueryBuilder<T>>;
	transaction: Mock<<R>(fn: (tx: MockQueryBuilder<T>) => Promise<R>) => Promise<R>>;
	insert: Mock<() => MockQueryBuilder<T>>;
	update: Mock<() => MockQueryBuilder<T>>;
	delete: Mock<() => MockQueryBuilder<T>>;
	query: Record<string, unknown>;
};

export function createMockDb(overrides?: Partial<MockQueryBuilder>): MockQueryBuilder {
	const chain = {} as MockQueryBuilder;

	const createChain = (): MockQueryBuilder => ({
		select: mock(() => chain),
		from: mock(() => chain),
		where: mock(() => chain),
		orderBy: mock(() => chain),
		limit: mock(() => chain),
		offset: mock(() => chain),
		returning: mock(() => Promise.resolve([])),
		values: mock(() => Promise.resolve([])),
		set: mock(() => chain),
		execute: mock(() => Promise.resolve({ rows: [] })),
		innerJoin: mock(() => chain),
		leftJoin: mock(() => chain),
		transaction: mock(async (fn) => fn(chain)),
		insert: mock(() => chain),
		update: mock(() => chain),
		delete: mock(() => chain),
		query: {},
		...overrides,
	});

	Object.assign(chain, createChain());
	return chain;
}

export function createMockDbWithResults<T>(results: {
	select?: T[];
	insert?: T[];
	update?: T[];
	delete?: T[];
}): MockQueryBuilder<T> {
	const chain = {} as MockQueryBuilder<T>;

	const baseChain = {
		select: mock(() => chain),
		from: mock(() => chain),
		where: mock(() => chain),
		orderBy: mock(() => chain),
		limit: mock(() => chain),
		offset: mock(() => chain),
		returning: mock(() => Promise.resolve(results.insert ?? results.update ?? [])),
		values: mock(() => Promise.resolve(results.insert ?? [])),
		set: mock(() => chain),
		execute: mock(() => Promise.resolve({ rows: results.select ?? [] })),
		innerJoin: mock(() => chain),
		leftJoin: mock(() => chain),
		transaction: mock(async (fn) => fn(chain)),
		insert: mock(() => chain),
		update: mock(() => chain),
		delete: mock(() => chain),
		query: {},
	};

	Object.assign(chain, baseChain);
	return chain;
}
