# Testing Guide

## Overview

This project uses **Bun Test** as the testing framework, integrated with Turborepo for monorepo support.

## Running Tests

```bash
# Run all tests across the monorepo
bun test

# Run tests for a specific package
bun test --filter @habitutor/api

# Run tests in watch mode
bun test:watch

# Run a specific test file
bun test packages/api/src/utils/date.test.ts
```

## Test Structure

```
packages/api/src/
├── __tests__/
│   ├── mocks/
│   │   ├── context.ts    # Mock ORPC context
│   │   ├── db.ts         # Mock Drizzle database
│   │   └── errors.ts     # Mock ORPC errors
│   └── factories/
│       ├── user.ts       # Test user factories
│       └── flashcard.ts  # Test flashcard data factories
├── utils/
│   └── date.test.ts      # Unit tests for date utils
├── lib/
│   └── content-access.test.ts  # Unit tests for access logic
└── routers/
    └── flashcard.test.ts # Router handler logic tests
```

## Test Database

For integration tests requiring a real database:

```bash
# Start test database
cd packages/db && docker compose -f docker-compose.test.yml up -d

# Run migrations against test database
TEST_DATABASE_URL=postgresql://postgres:password@localhost:6970/habitutor_test bun db:push

# Run integration tests
bun test
```

## Writing Tests

### Unit Tests

```typescript
import { describe, expect, test } from "bun:test";
import { myFunction } from "./myModule";

describe("myFunction", () => {
  test("should work correctly", () => {
    expect(myFunction("input")).toBe("expected");
  });
});
```

### Router Handler Tests

```typescript
import { describe, expect, test } from "bun:test";
import { createMockContext } from "../__tests__/mocks/context";
import { createMockErrors } from "../__tests__/mocks/errors";

describe("myHandler", () => {
  test("should handle request", async () => {
    const context = createMockContext();
    const errors = createMockErrors();
    
    // Test handler logic
  });
});
```

## Test Patterns

### Pure Logic Tests (Preferred)
Test business logic without database dependencies:
- Extract logic into pure functions
- Test decision trees, validations, calculations
- Fast, no external dependencies

### Mock-Based Tests
For handlers with dependencies:
- Use `createMockContext()` for auth/session
- Use `createMockErrors()` for error handling
- Use `createMockDb()` for database operations

### Integration Tests (Future)
For full end-to-end testing:
- Use test database (Docker)
- Seed test data with factories
- Clean up between tests

## CI/CD

Tests run automatically in CI pipelines. Ensure:
- All tests pass before merging
- New features include tests
- Bug fixes include regression tests
