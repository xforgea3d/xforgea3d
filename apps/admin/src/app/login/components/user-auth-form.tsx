'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as React from 'react'
import { createClient } from '@/lib/supabase/client'

export function UserAuthForm({ className }: { className?: string }) {
   const [username, setUsername] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [showPassword, setShowPassword] = React.useState(false)
   const [isLoading, setIsLoading] = React.useState(false)
   const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
   const [success, setSuccess] = React.useState(false)
   const [focusedField, setFocusedField] = React.useState<string | null>(null)
   const supabase = createClient()

   async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      setIsLoading(true)
      setErrorMsg(null)

      try {
         const key = username.toLowerCase().trim()
         if (!key) {
            setErrorMsg('Kullanıcı adı gerekli.')
            setIsLoading(false)
            return
         }

         const email = `${key}@xforgea3d.com`

         const { data, error } = await supabase.auth.signInWithPassword({ email, password })

         if (error) {
            setErrorMsg('Kullanıcı adı veya şifre hatalı.')
         } else if (data.session) {
            setSuccess(true)
            // Force cookie refresh before redirect
            await fetch('/api/auth/session', { method: 'POST' }).catch(() => {})
            setTimeout(() => {
               window.location.href = '/'
            }, 800)
         }
      } catch {
         setErrorMsg('Bir hata oluştu.')
      } finally {
         if (!success) setIsLoading(false)
      }
   }

   return (
      <div className={cn('space-y-6', className)}>
         <form onSubmit={onSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
               <motion.label
                  className="text-[11px] font-medium uppercase tracking-[0.15em] block"
                  animate={{
                     color: focusedField === 'username' ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.3)',
                  }}
                  transition={{ duration: 0.3 }}
               >
                  Kullanıcı Adı
               </motion.label>
               <motion.div className="relative" whileTap={{ scale: 0.995 }}>
                  <input
                     type="text"
                     placeholder="Kullanıcı adınız"
                     autoCapitalize="none"
                     autoCorrect="off"
                     autoComplete="username"
                     disabled={isLoading || success}
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     onFocus={() => setFocusedField('username')}
                     onBlur={() => setFocusedField(null)}
                     required
                     className={cn(
                        'w-full h-11 px-4 rounded-xl text-sm text-white placeholder:text-white/15',
                        'bg-white/[0.04] border border-white/[0.06]',
                        'outline-none transition-all duration-300',
                        'focus:border-orange-500/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/10',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                     )}
                  />
                  <AnimatePresence>
                     {focusedField === 'username' && (
                        <motion.div
                           className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
                           initial={{ scaleX: 0, opacity: 0 }}
                           animate={{ scaleX: 1, opacity: 1 }}
                           exit={{ scaleX: 0, opacity: 0 }}
                           transition={{ duration: 0.3 }}
                        />
                     )}
                  </AnimatePresence>
               </motion.div>
            </div>

            {/* Password */}
            <div className="space-y-2">
               <motion.label
                  className="text-[11px] font-medium uppercase tracking-[0.15em] block"
                  animate={{
                     color: focusedField === 'password' ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.3)',
                  }}
                  transition={{ duration: 0.3 }}
               >
                  Şifre
               </motion.label>
               <motion.div className="relative" whileTap={{ scale: 0.995 }}>
                  <input
                     type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••"
                     autoComplete="current-password"
                     disabled={isLoading || success}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     onFocus={() => setFocusedField('password')}
                     onBlur={() => setFocusedField(null)}
                     required
                     className={cn(
                        'w-full h-11 px-4 pr-11 rounded-xl text-sm text-white placeholder:text-white/15',
                        'bg-white/[0.04] border border-white/[0.06]',
                        'outline-none transition-all duration-300',
                        'focus:border-orange-500/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/10',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                     )}
                  />
                  <button
                     type="button"
                     tabIndex={-1}
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                     {focusedField === 'password' && (
                        <motion.div
                           className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
                           initial={{ scaleX: 0, opacity: 0 }}
                           animate={{ scaleX: 1, opacity: 1 }}
                           exit={{ scaleX: 0, opacity: 0 }}
                           transition={{ duration: 0.3 }}
                        />
                     )}
                  </AnimatePresence>
               </motion.div>
            </div>

            {/* Error */}
            <AnimatePresence mode="wait">
               {errorMsg && (
                  <motion.div
                     className="flex items-center gap-2 text-[13px] text-red-400/90 bg-red-500/[0.06] border border-red-500/10 rounded-xl px-4 py-2.5"
                     initial={{ opacity: 0, y: -8, height: 0 }}
                     animate={{ opacity: 1, y: 0, height: 'auto' }}
                     exit={{ opacity: 0, y: -8, height: 0 }}
                     transition={{ duration: 0.3 }}
                  >
                     <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                     {errorMsg}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
               type="submit"
               disabled={isLoading || !username || !password || success}
               className={cn(
                  'relative w-full h-11 rounded-xl text-sm font-medium',
                  'outline-none transition-all duration-300',
                  'disabled:cursor-not-allowed',
                  success
                     ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                     : 'bg-white/[0.06] text-white/80 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white hover:border-white/[0.12]',
                  (isLoading || !username || !password) && !success && 'opacity-60',
               )}
               whileHover={!isLoading && !success ? { scale: 1.01 } : {}}
               whileTap={!isLoading && !success ? { scale: 0.98 } : {}}
            >
               <AnimatePresence mode="wait">
                  {success ? (
                     <motion.span key="ok" className="inline-flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}>
                        <CheckCircle2 className="h-4 w-4" /> Hoş geldiniz
                     </motion.span>
                  ) : isLoading ? (
                     <motion.span key="load" className="inline-flex items-center gap-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Loader2 className="h-4 w-4 animate-spin" /> Giriş yapılıyor...
                     </motion.span>
                  ) : (
                     <motion.span key="idle" className="inline-flex items-center gap-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Giriş Yap <ArrowRight className="h-3.5 w-3.5" />
                     </motion.span>
                  )}
               </AnimatePresence>
               <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0"
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}
               />
            </motion.button>
         </form>

         {/* Divider */}
         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-white/[0.04]" />
            </div>
            <div className="relative flex justify-center">
               <motion.span
                  className="bg-transparent px-4 text-[10px] uppercase tracking-[0.2em] text-white/10"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
               >
                  Güvenli Bağlantı
               </motion.span>
            </div>
         </div>
      </div>
   )
}
