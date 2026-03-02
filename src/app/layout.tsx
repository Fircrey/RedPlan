import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RedPlan - Planificacion de redes electricas',
  description: 'Herramienta de planificacion geoespacial para redes de distribucion electrica',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <SupabaseProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
