'use client'

import { UserAuthForm } from '@/app/login/components/user-auth-form'
import { motion } from 'framer-motion'

export default function AuthenticationPage() {
   return (
      <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
         {/* Grid background */}
         <div className="absolute inset-0 opacity-[0.03]">
            <div
               className="absolute inset-0"
               style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
               }}
            />
         </div>

         {/* Floating orbs */}
         <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
               background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
               top: '-10%',
               right: '-10%',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
         />
         <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
               background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
               bottom: '-15%',
               left: '-10%',
            }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
         />

         {/* Scan line */}
         <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
         />

         {/* Content — centered single column */}
         <div className="relative z-10 w-full max-w-sm mx-auto px-6">
            {/* Logo */}
            <motion.div
               className="text-center mb-10"
               initial={{ opacity: 0, y: -30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
               <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-6 backdrop-blur-sm"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200 }}
               >
                  <motion.span
                     className="text-2xl font-black text-white tracking-tighter"
                     animate={{ opacity: [0.7, 1, 0.7] }}
                     transition={{ duration: 3, repeat: Infinity }}
                  >
                     x<span className="text-orange-500">F</span>
                  </motion.span>
               </motion.div>

               <motion.h1
                  className="text-xl font-semibold text-white tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
               >
                  xForgea<span className="text-orange-500">3D</span>
               </motion.h1>
               <motion.p
                  className="text-[13px] text-white/30 mt-1.5 tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
               >
                  Yönetim Paneli
               </motion.p>
            </motion.div>

            {/* Login card */}
            <motion.div
               className="relative"
               initial={{ opacity: 0, y: 30, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
               <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
               <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl p-8 border border-white/[0.04]">
                  <UserAuthForm />
               </div>
            </motion.div>

            {/* Footer */}
            <motion.p
               className="text-center text-[11px] text-white/15 mt-8 tracking-wider"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.2, duration: 1 }}
            >
               2025 xForgea3D
            </motion.p>
         </div>
      </div>
   )
}
