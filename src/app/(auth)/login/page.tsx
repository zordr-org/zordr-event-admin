import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  Calendar,
  BarChart3,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ZordrLogo } from '@/features/auth/components/ZordrLogo'

export const metadata: Metadata = {
  title: 'Admin Login | Zordr Admin Portal',
  description: 'Sign in to the Zordr Admin Portal.',
  robots: { index: false, follow: false },
}

const features = [
  {
    icon: Users,
    label: 'Organize',
    description: 'Onboard and support organizers',
  },
  {
    icon: Calendar,
    label: 'Operate',
    description: 'Manage events and ticketing',
  },
  {
    icon: BarChart3,
    label: 'Grow',
    description: 'Track performance and insights',
  },
  {
    icon: ShieldCheck,
    label: 'Ensure',
    description: 'Safe, secure and seamless operations',
  },
]

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row" aria-label="Zordr Admin login page">

      {/* ─── Left Panel ─────────────────────────────────────────────────── */}
      <section
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'hsl(145 60% 96%)' }}
        aria-hidden="true"
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-60 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, hsl(145 73% 44% / 0.25) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-32 right-8 w-48 h-48 rounded-full opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, hsl(145 73% 44% / 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Top: Logo + Admin Portal badge */}
        <div className="relative z-10">
          <ZordrLogo showTagline size="md" />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white px-3 py-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-brand" />
            <span className="text-xs font-semibold text-dark">Admin Portal</span>
          </div>
        </div>

        {/* Middle: Headline + Features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-[2.6rem] xl:text-5xl font-extrabold leading-tight text-dark">
              Powering<br />Memorable<br />Experiences
            </h1>
            <p className="text-base text-dark/60 max-w-xs leading-relaxed">
              Manage events, organizers, ticketing,<br />
              and more&nbsp;&mdash; all from one place.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, label, description }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-light border border-brand/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">{label}</p>
                  <p className="text-xs text-dark/55">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Illustration area + tagline */}
        <div className="relative z-10">
          {/* Decorative city illustration stand-in */}
          <div className="mb-4 relative h-28">
            {/* Handwritten-style text */}
            <div
              className="absolute right-8 top-0 text-brand font-bold text-lg leading-tight text-right"
              style={{ fontStyle: 'italic', transform: 'rotate(-2deg)' }}
            >
              Events<br />Build<br />Stronger<br />Communities
            </div>
            {/* Stylized skyline blocks */}
            <div className="absolute bottom-0 left-0 flex items-end gap-1">
              <div className="w-8 h-16 bg-dark/10 rounded-t-sm" />
              <div className="w-6 h-24 bg-dark/15 rounded-t-sm" />
              <div className="w-10 h-12 bg-brand/20 rounded-t-sm" />
              <div className="w-5 h-20 bg-dark/10 rounded-t-sm" />
              <div className="w-8 h-10 bg-brand/15 rounded-t-sm" />
              <div className="w-6 h-14 bg-dark/10 rounded-t-sm" />
              <div className="w-4 h-8 bg-brand/25 rounded-t-sm" />
              <div className="w-3 h-20 bg-dark/20 rounded-t-sm" />
              {/* Ground strip */}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-brand rounded-sm" />
          </div>

          <div className="border-t border-brand/20 pt-4">
            <p className="text-xs text-dark/50">
              A stronger event ecosystem<br />for a more vibrant tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Right Panel ─────────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-between min-h-screen bg-white px-6 py-8 lg:px-10">

        {/* Top nav: Back to Zordr */}
        <div className="w-full flex justify-end">
          <Link
            href="https://zordr.com"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Back to Zordr
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Center: Login card */}
        <div className="w-full max-w-[420px] my-auto">
          <div className="rounded-2xl border border-border bg-card shadow-card px-8 py-8 lg:px-10">
            {/* Card header */}
            <div className="text-center mb-7">
              <ZordrLogo size="md" className="items-center mb-1" />
              <p className="text-xs text-muted-foreground mb-4">Admin Portal</p>
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Login to your admin account</p>
            </div>

            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-between text-xs text-muted-foreground pt-4">
          <span>&copy; 2026 Zordr. All rights reserved.</span>
          <span>Admin Portal v1.0.0</span>
        </footer>
      </section>
    </main>
  )
}
