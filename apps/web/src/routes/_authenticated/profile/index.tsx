import { createFileRoute } from '@tanstack/react-router'
import Frame from './-components'

export const Route = createFileRoute('/_authenticated/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Frame />
}