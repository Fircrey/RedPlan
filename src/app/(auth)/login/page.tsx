import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="text-center text-sm text-gray-500 mt-4">
        No tienes cuenta?{' '}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          Registrate
        </Link>
      </p>
    </>
  )
}
