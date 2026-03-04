import Header from '@/components/header'
import { Hero } from './-components/hero'
import { CallToAction } from './-components/call-to-action'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home-premium/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className=''>
      <Header />
      <Hero />
      <CallToAction />
    </main>
  )
}
