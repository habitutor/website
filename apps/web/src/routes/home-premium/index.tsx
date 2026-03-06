import Header from '@/components/header'
import { Hero } from './-components/hero'
import { Bundling } from './-components/bundling'
import { CallToAction } from './-components/call-to-action.tsx'
import { createFileRoute } from '@tanstack/react-router'
import { Perintis } from './-components/perintis'
import { Tryout } from './-components/tryout'

export const Route = createFileRoute('/home-premium/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className=''>
      <Header />
      <Hero />
      <section className='space-y-30 pb-30 border-b-2 bg-tertiary-100 border-tertiary-200'>
        <Bundling />
        <Perintis />
        <Tryout />
      </section>
      <CallToAction />
    </main >
  )
}