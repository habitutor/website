export function PracticeQuestionHeader({ content }: { content: string }) {
  return (
    <div className="relative overflow-hidden rounded-sr-md bg-sr-blue-50">
      <div
        className="absolute top-1/2 -right-12.5 size-45.25 -translate-y-1/2 rounded-full bg-sr-blue-100"
        style={{ zIndex: 0 }}
      />

      <div className="relative flex items-center gap-6 px-6 py-4" style={{ zIndex: 1 }}>
        <h1 className="text-xl font-medium text-sr-ink">{content}</h1>
      </div>
    </div>
  );
}
