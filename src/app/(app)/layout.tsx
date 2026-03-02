import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'
import { NavRole } from '@/components/nav-role'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex-shrink-0">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-[var(--color-text)]">
            RedPlan
          </Link>
          <div className="flex items-center gap-3">
            <NavRole />
            <Link
              href="/dashboard"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Proyectos
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
