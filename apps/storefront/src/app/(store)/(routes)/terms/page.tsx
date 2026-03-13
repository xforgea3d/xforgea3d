import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kullanım Koşulları',
    description: 'xForgea3D web sitesi kullanım koşulları ve şartları.',
}

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-4xl py-12 prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Kullanım Koşulları</h1>

            <p>
                Bu web sitesini kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.
                Lütfen siteyi kullanmadan önce bu koşulları dikkatlice okuyunuz.
            </p>

            <h2>1. Genel Hükümler</h2>
            <p>
                Bu web sitesi xForgea3D tarafından işletilmektedir. Site üzerinden sunulan tüm ürün ve
                hizmetler bu kullanım koşullarına tabidir. xForgea3D, bu koşulları önceden bildirimde
                bulunmaksızın güncelleme hakkını saklı tutar.
            </p>

            <h2>2. Hesap Oluşturma ve Güvenlik</h2>
            <p>
                Sitemizden alışveriş yapabilmek için bir hesap oluşturmanız gerekmektedir. Hesap bilgilerinizin
                gizliliği ve güvenliği sizin sorumluluğunuzdadır. Hesabınız üzerinden gerçekleştirilen tüm
                işlemlerden siz sorumlu tutulursunuz.
            </p>

            <h2>3. Ürün ve Fiyat Bilgileri</h2>
            <p>
                Sitemizdeki ürün görselleri, açıklamaları ve fiyatları bilgilendirme amaçlıdır. Ürün görselleri
                ile gerçek ürün arasında renk tonlarında minimal farklılıklar olabilir. xForgea3D, fiyat ve ürün
                bilgilerinde oluşabilecek hataları düzeltme hakkını saklı tutar.
            </p>

            <h2>4. Sipariş ve Ödeme</h2>
            <p>
                Sipariş vermeniz, satış sözleşmesinin kurulduğu anlamına gelir. Ödeme işlemleri güvenli ödeme
                altyapısı üzerinden gerçekleştirilmektedir. xForgea3D, stok durumu veya fiyat hatası gibi
                nedenlerle siparişi iptal etme hakkını saklı tutar. Bu durumda ödemeniz tarafınıza iade edilir.
            </p>

            <h2>5. Fikri Mülkiyet Hakları</h2>
            <p>
                Bu web sitesinde yer alan tüm içerikler (tasarımlar, görseller, logolar, metinler, 3D modeller)
                xForgea3D&apos;nin fikri mülkiyetindedir. İçeriklerin izinsiz kopyalanması, çoğaltılması veya
                dağıtılması yasaktır ve yasal işlem başlatılabilir.
            </p>

            <h2>6. Kişiye Özel Üretim</h2>
            <p>
                Kişiye özel sipariş edilen ürünlerde, müşteri tarafından sağlanan tasarım dosyaları ve
                referanslar doğrultusunda üretim yapılır. Müşteri, sağladığı tasarımların fikri mülkiyet
                haklarına sahip olduğunu veya kullanım iznine sahip olduğunu beyan ve taahhüt eder.
            </p>

            <h2>7. Sorumluluk Sınırlandırması</h2>
            <p>
                xForgea3D, web sitesinin kesintisiz ve hatasız çalışacağını garanti etmez. Teknik aksaklıklar,
                bakım çalışmaları veya mücbir sebepler nedeniyle oluşabilecek erişim sorunlarından dolayı
                sorumluluk kabul edilmez.
            </p>

            <h2>8. Uyuşmazlık Çözümü</h2>
            <p>
                Bu kullanım koşullarından doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti kanunları
                uygulanır. Uyuşmazlık halinde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>

            <h2>9. İletişim</h2>
            <p>
                Kullanım koşullarıyla ilgili sorularınız için{' '}
                <a href="mailto:info@xforgea3d.com">info@xforgea3d.com</a> adresinden
                bizimle iletişime geçebilirsiniz.
            </p>
        </div>
    )
}
