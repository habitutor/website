import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/premium')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/premium"!</div>
}
