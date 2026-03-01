'use client'

import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const supabase = useSupabase()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Cerrar sesion
    </Button>
  )
}
