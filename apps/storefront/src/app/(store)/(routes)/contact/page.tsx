import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'İletişim',
    description: 'xForgea3D ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın.',
}

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-4xl py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">İletişim</h1>
            <p className="text-muted-foreground mb-10">
                Sorularınız, önerileriniz veya özel sipariş talepleriniz için bizimle iletişime geçebilirsiniz.
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* E-posta */}
                <div className="rounded-lg border p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-muted-foreground"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <h2 className="text-lg font-semibold">E-posta</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Genel sorular ve destek için:
                    </p>
                    <a
                        href="mailto:info@xforgea3d.com"
                        className="text-sm font-medium hover:underline"
                    >
                        info@xforgea3d.com
                    </a>
                    <br />
                    <a
                        href="mailto:destek@xforgea3d.com"
                        className="text-sm font-medium hover:underline"
                    >
                        destek@xforgea3d.com
                    </a>
                </div>

                {/* Telefon */}
                <div className="rounded-lg border p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-muted-foreground"
                        >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <h2 className="text-lg font-semibold">Telefon</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Hafta içi 09:00 - 18:00 arası:
                    </p>
                    <p className="text-sm font-medium">+90 (5XX) XXX XX XX</p>
                </div>

                {/* Adres */}
                <div className="rounded-lg border p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-muted-foreground"
                        >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <h2 className="text-lg font-semibold">Adres</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Atölye ve showroom:
                    </p>
                    <p className="text-sm font-medium">
                        xForgea3D Atölye<br />
                        İstanbul, Türkiye
                    </p>
                </div>
            </div>

            <div className="mt-12 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-2">Çalışma Saatleri</h2>
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between max-w-xs">
                        <span className="text-muted-foreground">Pazartesi - Cuma</span>
                        <span>09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                        <span className="text-muted-foreground">Cumartesi</span>
                        <span>10:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                        <span className="text-muted-foreground">Pazar</span>
                        <span>Kapalı</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
