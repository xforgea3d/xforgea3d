import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sıkça Sorulan Sorular',
    description: 'xForgea3D hakkında sıkça sorulan sorular ve cevapları.',
}

const faqs = [
    {
        question: 'Sipariş verdikten sonra ne kadar sürede teslim edilir?',
        answer: 'Standart ürünlerde siparişiniz 1-3 iş günü içinde kargoya verilir. Kargo süresi bulunduğunuz şehre göre 1-3 iş günü arasında değişmektedir. Kişiye özel (custom) ürünlerde üretim süresi tasarımın karmaşıklığına bağlı olarak 3-7 iş günü sürebilir.',
    },
    {
        question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        answer: 'Kredi kartı ve banka kartı ile ödeme kabul etmekteyiz. Tüm ödemeleriniz 256-bit SSL şifreleme ile güvence altındadır. Taksit seçenekleri de mevcuttur.',
    },
    {
        question: 'Ürün iadesi yapabilir miyim?',
        answer: 'Standart ürünlerde teslimat tarihinden itibaren 14 gün içinde iade hakkınız bulunmaktadır. Ürünün kullanılmamış, orijinal ambalajında ve faturasıyla birlikte iade edilmesi gerekmektedir. Kişiye özel üretilen ürünlerde ise üretim hatası hariç iade kabul edilmemektedir.',
    },
    {
        question: 'Kişiye özel (custom) sipariş verebilir miyim?',
        answer: 'Evet! xForgea3D olarak kişiye özel 3D baskı siparişleri kabul ediyoruz. İstediğiniz tasarım, ölçü ve renk seçenekleriyle size özel üretim yapabiliriz. Detaylı bilgi için iletişim sayfamızdan bize ulaşabilir veya Teklif Al formunu doldurabilirsiniz.',
    },
    {
        question: 'Kargom nerede, nasıl takip edebilirim?',
        answer: 'Siparişiniz kargoya verildiğinde, kargo takip numarası e-posta adresinize gönderilir. Ayrıca hesabınıza giriş yaparak "Siparişlerim" bölümünden kargo durumunuzu takip edebilirsiniz.',
    },
    {
        question: '3D baskı ürünlerin malzeme kalitesi nasıl?',
        answer: 'Ürünlerimizde endüstriyel kalitede PLA, PETG ve Resin malzemeler kullanmaktayız. Tüm malzemelerimiz dayanıklı, UV dayanımlı ve uzun ömürlüdür. Otomotiv aksesuarlarında ise yüksek ısı ve darbe dayanımına sahip özel malzemeler tercih edilmektedir.',
    },
    {
        question: 'Toptan sipariş verebilir miyim?',
        answer: 'Evet, toptan ve kurumsal siparişler için özel fiyatlandırma sunmaktayız. Detaylı bilgi almak için info@xforgea3d.com adresinden bizimle iletişime geçebilirsiniz.',
    },
    {
        question: 'Ürünlerde garanti var mı?',
        answer: 'Tüm ürünlerimiz üretim hatalarına karşı garantilidir. Ürününüz hasarlı veya hatalı ulaştıysa, teslimat tarihinden itibaren 7 gün içinde bizimle iletişime geçmeniz yeterlidir. Fotoğraflı bildirim sonrası ücretsiz değişim veya iade işlemi yapılmaktadır.',
    },
]

export default function FaqPage() {
    return (
        <div className="mx-auto max-w-4xl py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Sıkça Sorulan Sorular</h1>
            <p className="text-muted-foreground mb-10">
                Merak ettiğiniz soruların cevaplarını aşağıda bulabilirsiniz. Başka sorularınız varsa iletişim sayfamızdan bize ulaşabilirsiniz.
            </p>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <details
                        key={index}
                        className="group rounded-lg border p-4 [&_summary::-webkit-details-marker]:hidden"
                    >
                        <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                            <span>{faq.question}</span>
                            <span className="shrink-0 transition duration-300 group-open:rotate-180">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </span>
                        </summary>
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                        </p>
                    </details>
                ))}
            </div>
        </div>
    )
}
