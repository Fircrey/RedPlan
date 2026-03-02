import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'
import { NavRole } from '@/components/nav-role'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="h-16 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            PlanosElectricos
          </Link>
          <div className="flex items-center gap-4">
            <NavRole />
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Proyectos
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
