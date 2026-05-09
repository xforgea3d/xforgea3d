const PrivacyPolicy = () => {
   return (
      <div className="p-6 bg-muted-foreground/5 rounded-md">
         <div className="container mx-auto p-4">
            <h1 className="text-3xl font-semibold mb-4">Gizlilik ve Veri Koruması Politikası</h1>

            <p className="mb-4">
               xForgea3D olarak, müşterilerimizin kişisel verilerinin korunması ve gizliliğine
               en yüksek önemi vermekteyiz. Bu politika, web sitemiz üzerinden kişisel
               bilgilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında
               açıklıkla bilgi vermektedir.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               1. Topladığımız Bilgiler
            </h2>
            <p className="mb-4">
               Sitemizde alışveriş yaptığınız sırada ad, soyadı, e-posta adresi, telefon numarası,
               kargo ve fatura adresi, kredi kartı bilgileri gibi kişisel bilgiler toplayabiliriz.
               Ayrıca çerezler ve benzeri teknolojiler aracılığıyla tarama davranışınız hakkında
               bilgi toplayabiliriz.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               2. Bilgilerinizi Nasıl Kullanırız
            </h2>
            <p className="mb-4">
               Topladığımız kişisel bilgiler siparişlerinizi işlemek ve teslim etmek, müşteri
               desteği sağlamak, sipariş güncellemeleri göndermek, ürün önerileri sunmak ve
               yasal yükümlülükleri yerine getirmek amacıyla kullanılır. Pazarlama amaçlı
               iletişim için izniniz alınır.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               3. Bilgi Güvenliği
            </h2>
            <p className="mb-4">
               Kişisel verileriniz SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolları
               ile korunmaktadır. Ancak, internet üzerinden hiçbir iletişim yöntemi %100 güvenli
               değildir; kişisel riskiniz bulunmaktadır.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               4. Çerez Politikası
            </h2>
            <p className="mb-4">
               Sitemiz, kullanıcı deneyimini iyileştirmek, tercihleri hatırlamak ve tarama
               davranışını anlamak için çerezler kullanır. Tarayıcı ayarlarınızdan çerezleri
               devre dışı bırakabilirsiniz; ancak bu, site işlevselliğini etkileyebilir.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               5. Üçüncü Taraf Paylaşımı
            </h2>
            <p className="mb-4">
               Kişisel verileriniz, yasal gereklilik olmadığı sürece üçüncü taraflara satılmaz
               veya yayınlanmaz. Ancak, siparişinizi teslim etmek için kargo ve ödeme sağlayıcıları
               ile gerekli bilgiler paylaşılır.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               6. Haklarınız
            </h2>
            <p className="mb-4">
               Veri koruma mevzuatı uyarınca, kişisel verilerinize erişme, düzeltme, silme ve
               taşınabilirlik hakları bulunmaktadır. Talepleriniz için bizimle iletişime geçebilirsiniz.
            </p>

            <h2 className="text-xl font-semibold mb-2">
               7. İletişim
            </h2>
            <p className="mb-4">
               Gizlilik politikamız hakkında herhangi bir soru veya endişeniz varsa,
               lütfen bize <a href="mailto:info@xforgea3d.com" className="text-blue-600 hover:underline">info@xforgea3d.com</a> adresinden ulaşınız.
            </p>

            <p className="mt-8 text-xs text-muted-foreground">
               Son güncelleme: {new Date().getFullYear()}
            </p>
         </div>
      </div>
   )
}

export default PrivacyPolicy
