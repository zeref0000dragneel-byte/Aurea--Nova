'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Hexagon, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsPending(true)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // Si hay redirect, el componente se desmonta — no necesita setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_30%_20%,_var(--tw-gradient-stops))] from-slate-50 to-slate-100">
      <div className="w-full max-w-md">

        {/* Logo y marca */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#B45309] rounded-2xl mb-6 shadow-[0_20px_50px_rgba(15,23,42,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <Hexagon className="w-8 h-8 text-white fill-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-slate-800">
            Colmena OS
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Colmena OS — Amor de Colmena
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_20px_50px_rgba(15,23,42,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] p-10">
          <h2 className="text-xl font-light tracking-tight text-slate-800 mb-8">
            Iniciar sesión
          </h2>

          <form action={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200/50 focus-visible:ring-[#B45309] focus-visible:border-[#B45309]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10 rounded-xl bg-slate-50/50 border-slate-200/50 focus-visible:ring-[#B45309] focus-visible:border-[#B45309]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-200/50 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit — único acento dorado en login */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
                : 'Entrar al sistema'
              }
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-10">
          Acceso restringido. Solo personal autorizado.
        </p>
      </div>
    </div>
  )
}
