export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">RedPlan</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Planificacion de redes electricas</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
