import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: number; email: string; name: string }) => void
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, password } : { email, password, name }

      const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        return
      }

      // Salvar token no localStorage
      localStorage.setItem('gama_voz_token', data.token)
      localStorage.setItem('gama_voz_user', JSON.stringify(data.user))

      onLoginSuccess(data.token, data.user)
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#161616] to-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">GAMA Voz</h1>
          <p className="text-gray-400">Audiobook Generator com IA</p>
        </div>

        {/* Card */}
        <div className="bg-[#272727] rounded-2xl p-8 border border-white/10">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-[#88CE11] text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-[#88CE11] text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#88CE11]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#88CE11]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#88CE11]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#88CE11] text-black font-black rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Carregando...'
                : isLogin
                  ? 'Entrar'
                  : 'Criar Conta'}
            </button>
          </form>

          {/* Demo Account */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center mb-3">
              Teste com conta demo:
            </p>
            <div className="space-y-1 text-xs text-gray-500 bg-black/50 p-3 rounded">
              <p>
                <span className="text-gray-300">Email:</span> demo@gama.voz
              </p>
              <p>
                <span className="text-gray-300">Senha:</span> demo123456
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          🚀 Gerador de Audiobooks com IA
        </p>
      </div>
    </div>
  )
}
