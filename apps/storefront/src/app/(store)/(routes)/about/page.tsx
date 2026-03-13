import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Hakkımızda',
    description: 'xForgea3D hakkında bilgi edinin. 3D baskı ve otomotiv aksesuar çözümleri.',
}

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-4xl py-12 prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Hakkımızda</h1>

            <h2>Biz Kimiz?</h2>
            <p>
                xForgea3D, 3D baskı teknolojisi ve otomotiv aksesuar alanında uzmanlaşmış bir Türk markasıdır.
                Yüksek kaliteli malzemeler ve son teknoloji 3D yazıcılar kullanarak; figür, dekoratif ürün,
                prototip ve otomotiv aksesuarları üretmekteyiz. Her ürünümüzde detaylara verdiğimiz önem ve
                müşteri memnuniyeti önceliğimizdir.
            </p>

            <h2>Misyonumuz</h2>
            <p>
                Müşterilerimize en yüksek kalitede 3D baskı ürünler ve otomotiv aksesuarları sunarak,
                hayallerini gerçeğe dönüştürmek. Kişiye özel üretim anlayışımızla her müşterimizin
                benzersiz ihtiyaçlarına çözüm üretmek ve sektörde güvenilir bir marka olmayı sürdürmek.
            </p>

            <h2>Vizyonumuz</h2>
            <p>
                3D baskı teknolojisinin sunduğu sınırsız olanaklarla Türkiye&apos;nin lider üretim markası olmak.
                Yenilikçi tasarımlarımız ve sürdürülebilir üretim süreçlerimizle hem bireysel hem de
                kurumsal müşterilerimize katma değer sağlamak. Teknolojiyi sanatla buluşturarak,
                her ürünümüzde mükemmelliği hedeflemek.
            </p>

            <h2>Neden xForgea3D?</h2>
            <ul>
                <li><strong>Kaliteli Malzeme:</strong> Tüm ürünlerimizde endüstriyel kalitede malzemeler kullanıyoruz.</li>
                <li><strong>Kişiye Özel Üretim:</strong> İstediğiniz ölçü, renk ve tasarımda ürün üretebiliyoruz.</li>
                <li><strong>Hızlı Teslimat:</strong> Siparişlerinizi en kısa sürede hazırlayıp kargoya veriyoruz.</li>
                <li><strong>Müşteri Desteği:</strong> Satış öncesi ve sonrası tam destek sağlıyoruz.</li>
            </ul>
        </div>
    )
}
