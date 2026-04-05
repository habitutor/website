import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  test("renders with default alert semantics", () => {
    const html = renderToStaticMarkup(<Alert>Warning</Alert>);

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-slot="alert"');
    expect(html).toContain("Warning");
  });

  test("applies destructive variant styles", () => {
    const html = renderToStaticMarkup(<Alert variant="destructive">Error</Alert>);

    expect(html).toContain("text-destructive");
  });
});

describe("AlertTitle and AlertDescription", () => {
  test("render expected slots and content", () => {
    const html = renderToStaticMarkup(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    );

    expect(html).toContain('data-slot="alert-title"');
    expect(html).toContain('data-slot="alert-description"');
    expect(html).toContain("Title");
    expect(html).toContain("Description");
  });
});
