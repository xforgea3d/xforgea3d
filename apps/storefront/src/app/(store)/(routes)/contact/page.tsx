import { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
    title: 'İletişim',
    description:
        'xForgea3D ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın.',
}

export default function ContactPage() {
    return (
        <div className="pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent dark:from-orange-500/20 dark:via-orange-400/10 dark:to-transparent">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-500/20">
                        <Mail className="h-8 w-8 text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        İletişim
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Sorularınız, önerileriniz veya özel sipariş
                        talepleriniz için bizimle iletişime geçebilirsiniz.
                        Size en kısa sürede dönüş yapacağız.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4">
                {/* Contact Cards */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* E-posta */}
                    <div className="group rounded-xl border bg-card p-6 space-y-3 transition-all hover:shadow-lg hover:border-orange-500/50 hover:-translate-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                            <Mail className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">E-posta</h2>
                        <p className="text-sm text-muted-foreground">
                            Genel sorular ve destek için:
                        </p>
                        <div className="space-y-1">
                            <a
                                href="mailto:info@xforgea3d.com"
                                className="block text-sm font-medium text-orange-500 hover:underline"
                            >
                                info@xforgea3d.com
                            </a>
                            <a
                                href="mailto:destek@xforgea3d.com"
                                className="block text-sm font-medium text-orange-500 hover:underline"
                            >
                                destek@xforgea3d.com
                            </a>
                        </div>
                    </div>

                    {/* Telefon */}
                    <div className="group rounded-xl border bg-card p-6 space-y-3 transition-all hover:shadow-lg hover:border-orange-500/50 hover:-translate-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                            <Phone className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Telefon</h2>
                        <p className="text-sm text-muted-foreground">
                            Hafta içi 09:00 - 18:00 arası:
                        </p>
                        <a
                            href="tel:+905382880738"
                            className="block text-sm font-medium text-orange-500 hover:underline"
                        >
                            +90 (538) 288 07 38
                        </a>
                    </div>

                    {/* Adres */}
                    <div className="group rounded-xl border bg-card p-6 space-y-3 transition-all hover:shadow-lg hover:border-orange-500/50 hover:-translate-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Adres</h2>
                        <p className="text-sm text-muted-foreground">
                            Atölye ve showroom:
                        </p>
                        <p className="text-sm font-medium">
                            xForgea3D Atölye
                            <br />
                            Ataşehir, Küçükbakkalköy Mah.
                            <br />
                            Kayışdağı Cd. No:1
                            <br />
                            İstanbul, Türkiye
                        </p>
                    </div>

                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/905382880738"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border bg-card p-6 space-y-3 transition-all hover:shadow-lg hover:border-green-500/50 hover:-translate-y-1"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-white">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">WhatsApp</h2>
                        <p className="text-sm text-muted-foreground">
                            Hızlı destek için WhatsApp üzerinden yazın:
                        </p>
                        <span className="block text-sm font-medium text-green-500">
                            Sohbet Başlat &rarr;
                        </span>
                    </a>
                </div>

                {/* Çalışma Saatleri */}
                <div className="mt-10 rounded-xl border bg-card p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                            <Clock className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">
                            Çalışma Saatleri
                        </h2>
                    </div>
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                            <span className="text-muted-foreground">
                                Pazartesi - Cuma
                            </span>
                            <span className="font-medium">09:00 - 18:00</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                            <span className="text-muted-foreground">
                                Cumartesi
                            </span>
                            <span className="font-medium">10:00 - 15:00</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                            <span className="text-muted-foreground">
                                Pazar
                            </span>
                            <span className="font-medium text-red-500">
                                Kapalı
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="mt-10 rounded-xl border bg-card p-8 transition-all hover:shadow-lg">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Bize Yazın
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Formu doldurarak bize mesaj gönderebilirsiniz. En kısa
                        sürede size dönüş yapacağız.
                    </p>
                    <ContactForm />
                </div>
            </div>
        </div>
    )
}
