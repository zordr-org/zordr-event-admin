import { SessionProvider } from '@/providers/SessionProvider'
import { AdminShell } from '@/components/shell/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}