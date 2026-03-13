import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kargo ve Teslimat',
    description: 'xForgea3D kargo ve teslimat bilgileri, süreleri ve takip detayları.',
}

export default function ShippingPage() {
    return (
        <div className="mx-auto max-w-4xl py-12 prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Kargo ve Teslimat</h1>

            <h2>1. Kargo Süreleri</h2>
            <p>
                Siparişleriniz onaylandıktan sonra aşağıdaki sürelerde kargoya teslim edilir:
            </p>
            <ul>
                <li><strong>Standart Ürünler:</strong> 1-3 iş günü içinde kargoya verilir.</li>
                <li><strong>Kişiye Özel (Custom) Ürünler:</strong> Üretim sürecine bağlı olarak 3-7 iş günü içinde kargoya verilir.</li>
                <li><strong>Otomotiv Aksesuarları:</strong> Stok durumuna göre 1-5 iş günü içinde kargoya verilir.</li>
            </ul>

            <h2>2. Teslimat Süreleri</h2>
            <p>
                Kargoya verilen ürünleriniz, bulunduğunuz lokasyona bağlı olarak <strong>1-3 iş günü</strong> içinde
                adresinize teslim edilir. Büyükşehirlerde teslimat genellikle 1 iş günü içinde gerçekleşmektedir.
            </p>

            <h2>3. Kargo Ücreti</h2>
            <p>
                Belirli bir tutarın üzerindeki siparişlerinizde <strong>ücretsiz kargo</strong> avantajından
                yararlanabilirsiniz. Ücretsiz kargo limiti altındaki siparişlerde kargo ücreti
                ödeme aşamasında hesaplanarak gösterilir.
            </p>

            <h2>4. Kargo Takibi</h2>
            <p>
                Siparişiniz kargoya verildiğinde, kayıtlı e-posta adresinize kargo takip numarası
                gönderilir. Kargo takibinizi aşağıdaki yollarla yapabilirsiniz:
            </p>
            <ul>
                <li>Hesabınızda <strong>&quot;Siparişlerim&quot;</strong> bölümünden</li>
                <li>E-posta ile gönderilen kargo takip linkinden</li>
                <li>Kargo firmasının web sitesinden takip numaranız ile</li>
            </ul>

            <h2>5. Teslimat Sırasında Dikkat Edilmesi Gerekenler</h2>
            <p>
                Kargonuzu teslim alırken mutlaka dış ambalajı kontrol ediniz. Ezilme, yırtılma veya
                herhangi bir hasar tespit ederseniz, kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturduktan
                sonra teslim alınız. Tutanak tutulmadan teslim alınan hasarlı kargolarda sorumluluk alıcıya aittir.
            </p>

            <h2>6. Teslimat Yapılamadığında</h2>
            <p>
                Adresinizde bulunamamanız durumunda kargo firması size bilgi mesajı gönderecektir.
                2 başarısız teslimat denemesinden sonra kargonuz en yakın şubeye yönlendirilir.
                Şubede 3 iş günü bekletilen ve teslim alınmayan kargolar tarafımıza iade edilir.
            </p>
        </div>
    )
}
