import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500 mt-4">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Ingresar
        </Link>
      </p>
    </>
  )
}
