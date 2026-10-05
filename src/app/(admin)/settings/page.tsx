import { Metadata } from 'next'
import { SettingsForm } from '@/features/settings'

export const metadata: Metadata = {
  title: 'Settings | Zordr Admin',
}

export default function SettingsPage() {
  return <SettingsForm />
}