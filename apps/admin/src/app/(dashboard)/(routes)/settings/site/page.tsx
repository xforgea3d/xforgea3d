export const revalidate = 0
import prisma from '@/lib/prisma'
import { SiteSettingsForm } from './components/site-settings-form'

export default async function SiteSettingsPage() {
    let settings: any = null
    try {
        settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1 },
        })
    } catch (error) {
        console.warn('[SiteSettingsPage] Failed to fetch site settings:', error)
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SiteSettingsForm initialData={settings as any} />
            </div>
        </div>
    )
}
