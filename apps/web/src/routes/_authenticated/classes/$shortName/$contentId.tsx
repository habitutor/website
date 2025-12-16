import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/classes/$shortName/$contentId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/classes/$shortName/$contentId"!</div>
}
