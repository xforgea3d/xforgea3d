'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { EmailInput } from '@/components/native/EmailInput'
import { validateEmail } from '@/lib/email-validation'

export function ContactForm() {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [email, setEmail] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const emailErr = validateEmail(email)
        if (emailErr) {
            toast({ title: 'Hata', description: emailErr, variant: 'destructive' })
            return
        }

        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const name = formData.get('name') as string
        const subject = formData.get('subject') as string
        const message = formData.get('message') as string

        if (!name || !subject || !message) {
            toast({ title: 'Hata', description: 'Lütfen tüm alanları doldurunuz.', variant: 'destructive' })
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Mesaj gönderilemedi')
            }

            toast({
                title: 'Mesajınız iletildi!',
                description: 'En kısa sürede size geri dönüş yapacağız. Teşekkürler!',
            })
            form.reset()
            setEmail('')
        } catch (error: any) {
            toast({ title: 'Hata', description: error.message || 'Bir hata oluştu.', variant: 'destructive' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Adınız Soyadınız"
                        required
                        maxLength={100}
                        className="rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <EmailInput
                        id="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="ornek@email.com"
                        required
                        className="rounded-xl"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                    id="subject"
                    name="subject"
                    placeholder="Mesajınızın konusu"
                    required
                    maxLength={200}
                    className="rounded-xl"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Mesaj</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Mesajınızı buraya yazın..."
                    rows={5}
                    required
                    maxLength={5000}
                    className="rounded-xl resize-none"
                />
            </div>
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8"
                size="lg"
            >
                {isSubmitting ? (
                    'Gönderiliyor...'
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Mesaj Gönder
                    </>
                )}
            </Button>
        </form>
    )
}
