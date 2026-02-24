'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { isEmailValid } from '@persepolis/regex'
import { Loader, MailIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
   const [isLoading, setIsLoading] = React.useState<boolean>(false)
   const [fetchedOTP, setFetchedOTP] = React.useState<boolean>(false)

   return (
      <div className={cn('grid gap-6', className)} {...props}>
         {fetchedOTP ? (
            <VerifyComponents
               isLoading={isLoading}
               setIsLoading={setIsLoading}
            />
         ) : (
            <TryComponents
               isLoading={isLoading}
               setIsLoading={setIsLoading}
               setFetchedOTP={setFetchedOTP}
            />
         )}
         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
               </span>
            </div>
         </div>
         <Button disabled={true} type="button">
            <MailIcon className="mr-2 h-4" />
            Email Only (Supabase)
         </Button>
      </div>
   )
}

function TryComponents({ isLoading, setIsLoading, setFetchedOTP }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const email = searchParams.get('email')
   const supabase = createClient()

   const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))

      params.set('email', event.target.value)
      const search = params.toString()
      const query = search ? `?${search}` : ''

      router.replace(`${pathname}${query}`, {
         scroll: false,
      })
   }

   async function onSubmitEmail() {
      if (!email) return;

      try {
         setIsLoading(true)

         const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
               // Optionally redirect to a specific URL after magic link click
               emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
         })

         if (error) {
            console.error('Supabase OTP Error:', error.message)
            // Handle error logic (toast, etc)
         } else {
            setFetchedOTP(true)
         }

      } catch (error) {
         console.error({ error })
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <>
         <div className="grid gap-1">
            <Label
               className="text-sm font-light text-foreground/60"
               htmlFor="email"
            >
               Email
            </Label>
            <Input
               id="email"
               placeholder="name@example.com"
               type="email"
               autoCapitalize="none"
               autoComplete="email"
               autoCorrect="off"
               disabled={isLoading}
               onChange={handleEmailChange}
               required
            />
         </div>
         <Button
            onClick={onSubmitEmail}
            disabled={isLoading || !isEmailValid(email)}
         >
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Send Magic Link / OTP
         </Button>
      </>
   )
}

function VerifyComponents({ isLoading, setIsLoading }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const email = searchParams.get('email')
   const OTP = searchParams.get('OTP')
   const supabase = createClient()

   const handleOTPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))

      params.set('OTP', event.target.value)
      const search = params.toString()
      const query = search ? `?${search}` : ''

      router.replace(`${pathname}${query}`, {
         scroll: false,
      })
   }

   async function onVerifyOTP() {
      if (!email || !OTP) return;

      try {
         setIsLoading(true)

         const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: OTP,
            type: 'email',
         })

         if (error) {
            console.error('Supabase Verify OTP Error:', error.message)
            // Handle error logic
         } else if (data.session) {
            // Success! Session is established automatically by SSR client wrapper setting cookies.
            const redirectParams = searchParams.get('redirect')
            window.location.assign(redirectParams ? redirectParams : `/`)
         }

      } catch (error) {
         console.error({ error })
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <>
         <div className="grid gap-1">
            <Label
               className="text-sm font-light text-foreground/60"
               htmlFor="OTP"
            >
               One-Time Password
            </Label>
            <Input
               placeholder="123456"
               disabled={isLoading}
               onChange={handleOTPChange}
               required
            />
         </div>
         <Button onClick={onVerifyOTP} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Submit
         </Button>
      </>
   )
}
