import prisma from '@/lib/prisma'

export default async function MaintenancePage() {
    let settings: any = null
    try {
        settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
    } catch {}

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md text-center space-y-6">
                <div className="text-6xl">🔧</div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {settings?.brand_name ?? 'xForgea3D'}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    {settings?.maintenance_message ?? 'Bakım çalışmaları devam ediyor. Lütfen daha sonra tekrar deneyin.'}
                </p>
                <p className="text-sm text-muted-foreground">
                    Sorularınız için:{' '}
                    {settings?.contact_email && (
                        <a href={`mailto:${settings.contact_email}`} className="underline">
                            {settings.contact_email}
                        </a>
                    )}
                </p>
            </div>
        </div>
    )
}
