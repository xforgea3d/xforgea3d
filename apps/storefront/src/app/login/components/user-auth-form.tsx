'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils'
import { validateEmail } from '@/lib/email-validation'
import { Loader } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { createClient } from '@/lib/supabase/client'

// Use a simple colored Google G icon SVG instead of lucide mail
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg viewBox="0 0 24 24" {...props}>
         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
   )
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
   const [isLoading, setIsLoading] = React.useState<boolean>(false)
   const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
   const supabase = createClient()
   const searchParams = useSearchParams()

   /**
    * Returns the site origin for auth redirects.
    * Uses NEXT_PUBLIC_SITE_URL if available (production),
    * otherwise falls back to window.location.origin (dev).
    */
   function getSiteOrigin(): string {
      const envUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (envUrl) return envUrl.replace(/\/$/, '')
      return window.location.origin
   }

   async function handleGoogleOAuth() {
      try {
         setIsGoogleLoading(true)
         const redirectParams = searchParams.get('redirect') || '/'
         const origin = getSiteOrigin()
         const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectParams)}`

         const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
               redirectTo,
            }
         })

         if (error) {
            console.error('Google OAuth Error:', error.message)
            alert('Google ile giris su anda aktif degil. Lutfen e-posta/sifre ile giris yapin.')
         }
      } catch (error) {
         console.error({ error })
      } finally {
         setIsGoogleLoading(false)
      }
   }

   return (
      <div className={cn('grid gap-6', className)} {...props}>

         <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
               <TabsTrigger value="login">Giriş Yap</TabsTrigger>
               <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
               <SignInForm isLoading={isLoading} setIsLoading={setIsLoading} supabase={supabase} />
            </TabsContent>

            <TabsContent value="register">
               <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} supabase={supabase} />
            </TabsContent>
         </Tabs>

         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                  Veya şununla devam et
               </span>
            </div>
         </div>

         <Button
            variant="outline"
            type="button"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleOAuth}
         >
            {isGoogleLoading ? (
               <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
               <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Google ile Devam Et
         </Button>
      </div>
   )
}

function setLoggedInCookie() {
   document.cookie = 'logged-in=true; path=/; max-age=31536000; SameSite=Lax'
}

function SignInForm({ isLoading, setIsLoading, supabase }) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const redirectParams = searchParams.get('redirect')

   const [email, setEmail] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [errorMsg, setErrorMsg] = React.useState('')
   const [emailError, setEmailError] = React.useState('')
   const [forgotMode, setForgotMode] = React.useState(false)
   const [forgotMsg, setForgotMsg] = React.useState('')
   const [forgotLoading, setForgotLoading] = React.useState(false)

   function handleEmailChange(val: string) {
      setEmail(val)
      const err = validateEmail(val)
      setEmailError(err || '')
   }

   async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!email || !password) return
      const emailErr = validateEmail(email)
      if (emailErr) { setEmailError(emailErr); return }
      setErrorMsg('')

      try {
         setIsLoading(true)
         const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
         })

         if (error) {
            setErrorMsg('E-posta veya sifre hatali.')
            console.error('SignIn Error:', error.message)
         } else if (data.session) {
            setLoggedInCookie()
            const target = redirectParams && redirectParams.startsWith('/') && !redirectParams.startsWith('//') ? redirectParams : '/'
            window.location.assign(target)
         }
      } catch (error) {
         setErrorMsg('Beklenmeyen bir hata olustu.')
      } finally {
         setIsLoading(false)
      }
   }

   async function handleForgotPassword(e: React.FormEvent) {
      e.preventDefault()
      if (!email) return
      setForgotMsg('')
      setErrorMsg('')

      try {
         setForgotLoading(true)
         const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
         })
         const data = await res.json()
         if (data.success) {
            setForgotMsg(data.message)
         } else {
            setErrorMsg(data.error || 'Bir hata olustu.')
         }
      } catch {
         setErrorMsg('Beklenmeyen bir hata olustu.')
      } finally {
         setForgotLoading(false)
      }
   }

   if (forgotMode) {
      return (
         <form onSubmit={handleForgotPassword} className="grid gap-3">
            <div className="grid gap-1">
               <Label className="text-sm font-light text-foreground/60" htmlFor="email-forgot">
                  E-posta
               </Label>
               <Input
                  id="email-forgot"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={forgotLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
               />
            </div>
            {forgotMsg && (
               <p className="text-xs text-emerald-600 dark:text-emerald-400">{forgotMsg}</p>
            )}
            {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
            <Button
               type="submit"
               disabled={forgotLoading || !!validateEmail(email)}
            >
               {forgotLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
               Sifre Sifirlama Baglantisi Gonder
            </Button>
            <button
               type="button"
               className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
               onClick={() => { setForgotMode(false); setForgotMsg(''); setErrorMsg('') }}
            >
               Girisse don
            </button>
         </form>
      )
   }

   return (
      <form onSubmit={onSubmit} className="grid gap-3">
         <div className="grid gap-1">
            <Label className="text-sm font-light text-foreground/60" htmlFor="email-login">
               E-posta
            </Label>
            <Input
               id="email-login"
               placeholder="name@example.com"
               type="email"
               autoCapitalize="none"
               autoComplete="email"
               autoCorrect="off"
               disabled={isLoading}
               value={email}
               onChange={(e) => handleEmailChange(e.target.value)}
               required
               className={emailError ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
         </div>
         <div className="grid gap-1">
            <div className="flex items-center justify-between">
               <Label className="text-sm font-light text-foreground/60" htmlFor="password-login">
                  Sifre
               </Label>
               <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                  onClick={() => { setForgotMode(true); setErrorMsg('') }}
               >
                  Sifremi unuttum
               </button>
            </div>
            <Input
               id="password-login"
               placeholder="********"
               type="password"
               disabled={isLoading}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
            />
         </div>
         {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
         <Button
            type="submit"
            disabled={isLoading || !!validateEmail(email) || password.length < 6}
         >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Giris Yap
         </Button>
      </form>
   )
}

function SignUpForm({ isLoading, setIsLoading, supabase }) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const redirectParams = searchParams.get('redirect')

   const [email, setEmail] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [name, setName] = React.useState('')
   const [errorMsg, setErrorMsg] = React.useState('')
   const [emailError, setEmailError] = React.useState('')
   const [successMsg, setSuccessMsg] = React.useState('')

   function handleEmailChange(val: string) {
      setEmail(val)
      const err = validateEmail(val)
      setEmailError(err || '')
   }

   async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!email || !password || !name) return
      const emailErr = validateEmail(email)
      if (emailErr) { setEmailError(emailErr); return }
      setErrorMsg('')
      setSuccessMsg('')

      try {
         setIsLoading(true)
         const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin
         const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: {
                  full_name: name,
               },
               emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectParams || '/')}`,
            }
         })

         if (error) {
            if (error.message?.includes('already registered') || error.message?.includes('already been registered') || error.message?.includes('User already registered')) {
               setErrorMsg('already_exists')
            } else if (error.message?.includes('Database error saving new user')) {
               // Supabase auth schema issue — user may already exist in auth.users
               // Try signing in directly; if the user was partially created this recovers the flow
               const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
               if (signInData?.session) {
                  setLoggedInCookie()
                  setSuccessMsg('welcome')
                  setTimeout(() => {
                     const target = redirectParams && redirectParams.startsWith('/') && !redirectParams.startsWith('//') ? redirectParams : '/'
                     window.location.assign(target)
                  }, 2000)
                  return
               }
               setErrorMsg('Hesap oluşturulurken bir sorun oluştu. Lütfen farklı bir e-posta deneyin veya giriş yapmayı deneyin.')
            } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
               setErrorMsg('Çok fazla deneme. Lütfen birkaç dakika bekleyip tekrar deneyin.')
            } else if (error.message?.includes('password') && error.message?.includes('characters')) {
               setErrorMsg('Şifre en az 6 karakter olmalıdır.')
            } else {
               setErrorMsg(error.message || 'Hesap oluşturulurken bir hata oluştu.')
            }
            console.error('SignUp Error:', error.message)
         } else if (data?.user?.identities?.length === 0) {
            setErrorMsg('already_exists')
         } else if (data.session) {
            setLoggedInCookie()
            setSuccessMsg('welcome')
            setTimeout(() => {
               const target = redirectParams && redirectParams.startsWith('/') && !redirectParams.startsWith('//') ? redirectParams : '/'
               window.location.assign(target)
            }, 2000)
         } else {
            // No session returned — try to sign in directly (email confirmation may be disabled)
            try {
               const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
               if (signInData?.session) {
                  setLoggedInCookie()
                  setSuccessMsg('welcome')
                  setTimeout(() => {
                     const target = redirectParams && redirectParams.startsWith('/') && !redirectParams.startsWith('//') ? redirectParams : '/'
                     window.location.assign(target)
                  }, 2000)
               } else if (signInError?.message?.includes('Email not confirmed')) {
                  setSuccessMsg('Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.')
               } else {
                  setSuccessMsg('Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.')
               }
            } catch {
               setSuccessMsg('Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.')
            }
         }
      } catch (error) {
         setErrorMsg('Beklenmeyen bir hata oluştu.')
      } finally {
         setIsLoading(false)
      }
   }

   if (successMsg === 'welcome') {
      return (
         <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in duration-500">
            <div className="relative">
               <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
               <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
            </div>
            <div className="text-center space-y-1">
               <h3 className="text-lg font-semibold">Hosgeldiniz! 🎉</h3>
               <p className="text-sm text-muted-foreground">Hesabiniz olusturuldu, yonlendiriliyorsunuz...</p>
            </div>
         </div>
      )
   }

   if (successMsg) {
      return (
         <div className="rounded-md bg-emerald-500/15 border border-emerald-500/30 p-4 text-sm text-emerald-600 dark:text-emerald-400">
            {successMsg}
         </div>
      )
   }

   return (
      <form onSubmit={onSubmit} className="grid gap-3">
         <div className="grid gap-1">
            <Label className="text-sm font-light text-foreground/60" htmlFor="name-register">
               Ad Soyad
            </Label>
            <Input
               id="name-register"
               placeholder="Mert Yılmaz"
               type="text"
               disabled={isLoading}
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
            />
         </div>
         <div className="grid gap-1">
            <Label className="text-sm font-light text-foreground/60" htmlFor="email-register">
               E-posta
            </Label>
            <Input
               id="email-register"
               placeholder="name@example.com"
               type="email"
               autoCapitalize="none"
               autoComplete="email"
               autoCorrect="off"
               disabled={isLoading}
               value={email}
               onChange={(e) => handleEmailChange(e.target.value)}
               required
               className={emailError ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
         </div>
         <div className="grid gap-1 mb-2">
            <Label className="text-sm font-light text-foreground/60" htmlFor="password-register">
               Şifre (Min. 6 Karakter)
            </Label>
            <Input
               id="password-register"
               placeholder="••••••••"
               type="password"
               disabled={isLoading}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               minLength={6}
            />
         </div>
         {errorMsg === 'already_exists' ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4 space-y-3">
               <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                     <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Bu e-posta adresiyle zaten bir hesap var
                     </p>
                     <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Yukarıdaki &quot;Giriş Yap&quot; sekmesinden mevcut hesabınıza giriş yapabilirsiniz.
                     </p>
                  </div>
               </div>
            </div>
         ) : errorMsg ? (
            <p className="text-xs text-destructive">{errorMsg}</p>
         ) : null}
         <Button
            type="submit"
            disabled={isLoading || !!validateEmail(email) || password.length < 6 || !name}
         >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Hesap Oluştur
         </Button>
      </form>
   )
}
