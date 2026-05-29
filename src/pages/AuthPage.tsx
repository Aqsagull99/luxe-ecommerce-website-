import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

type FormMode = 'login' | 'register' | 'forgot'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<FormMode>((searchParams.get('mode') as FormMode) ?? 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()
  const { fetchProfile, setUser } = useAuthStore()

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
      const redirect = searchParams.get('redirect') ?? '/'
      navigate(redirect)
    }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
      },
    })
    if (err) { setError(err.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.fullName,
        phone: form.phone,
        role: 'customer',
        loyalty_points: 0,
      })
      setUser(data.user)
      await fetchProfile(data.user.id)
      navigate('/')
    }
    setLoading(false)
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    })
    if (err) { setError(err.message) } else {
      setSuccessMsg('Password reset email sent! Please check your inbox.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-widest text-sidebar-foreground">
            Maison Luxe
          </Link>
        </div>
        <div className="relative z-10">
          <blockquote className="font-serif text-2xl text-sidebar-foreground/80 leading-relaxed italic mb-6">
            "Luxury is in each detail."
          </blockquote>
          <p className="text-sidebar-foreground/50 text-sm">— Hubert de Givenchy</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-sidebar-accent/30" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-2 lg:hidden">
            <Link to="/" className="font-serif text-2xl font-semibold tracking-widest text-foreground">
              Maison Luxe
            </Link>
          </div>

          {/* Mode Tabs */}
          {mode !== 'forgot' && (
            <div className="flex gap-1 mb-8 p-1 bg-muted rounded-sm">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccessMsg('') }}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-xs transition-all',
                    mode === m ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'login' && (
                <form onSubmit={(e) => void handleLogin(e)} className="flex flex-col gap-5">
                  <div>
                    <h1 className="font-serif text-3xl font-semibold mb-1">Welcome back</h1>
                    <p className="text-muted-foreground text-sm">Sign in to your Maison Luxe account</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="email" type="email" placeholder="you@example.com"
                          className="pl-9" value={form.email} onChange={update('email')} required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          value={form.password}
                          onChange={update('password')}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{error}</p>}

                  <Button type="submit" size="lg" className="gap-2 w-full" disabled={loading}>
                    {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight className="size-4" /></>}
                  </Button>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={(e) => void handleRegister(e)} className="flex flex-col gap-5">
                  <div>
                    <h1 className="font-serif text-3xl font-semibold mb-1">Create Account</h1>
                    <p className="text-muted-foreground text-sm">Join Maison Luxe and discover luxury living</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input id="fullName" placeholder="Your full name" className="pl-9" value={form.fullName} onChange={update('fullName')} required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input id="phone" placeholder="+92 300 0000000" className="pl-9" value={form.phone} onChange={update('phone')} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input id="reg-email" type="email" placeholder="you@example.com" className="pl-9" value={form.email} onChange={update('email')} required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 characters"
                          className="pl-9 pr-10"
                          value={form.password}
                          onChange={update('password')}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          className="pl-9"
                          value={form.confirmPassword}
                          onChange={update('confirmPassword')}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{error}</p>}

                  <Button type="submit" size="lg" className="gap-2 w-full" disabled={loading}>
                    {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight className="size-4" /></>}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account you agree to our{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
                  </p>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={(e) => void handleForgot(e)} className="flex flex-col gap-5">
                  <div>
                    <button type="button" onClick={() => setMode('login')} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                      ← Back to sign in
                    </button>
                    <h1 className="font-serif text-3xl font-semibold mb-1">Reset Password</h1>
                    <p className="text-muted-foreground text-sm">Enter your email and we'll send a reset link</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input id="forgot-email" type="email" placeholder="you@example.com" className="pl-9" value={form.email} onChange={update('email')} required />
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{error}</p>}
                  {successMsg && <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-sm">{successMsg}</p>}

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={loading || !!successMsg}>
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <Separator className="my-6" />
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
