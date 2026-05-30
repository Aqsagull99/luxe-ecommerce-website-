import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'
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
      <SEO title="Sign In / Register" description="Sign in to your Maison Luxe account or create a new account to start shopping." />
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

          {/* OAuth Buttons */}
          {mode !== 'forgot' && (
            <div className="mb-6">
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-3 w-full"
                  onClick={() => void supabase.auth.signInWithOAuth({ provider: 'google' })}
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-3 w-full"
                  onClick={() => void supabase.auth.signInWithOAuth({ provider: 'facebook' })}
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                </Button>
              </div>
              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or continue with email
                </span>
              </div>
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
