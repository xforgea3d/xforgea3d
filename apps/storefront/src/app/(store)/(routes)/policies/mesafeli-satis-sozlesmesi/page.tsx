import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'xForgea3D Mesafeli Satış Sözleşmesi.',
}

export default function MesafeliSatisSozlesmesi() {
    return (
        <div className="mx-auto max-w-4xl py-12 prose prose-neutral dark:prose-invert">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Mesafeli Satış Sözleşmesi</h1>

            <h2>MADDE 1 - TARAFLAR</h2>

            <h3>1.1. SATICI BİLGİLERİ</h3>
            <table>
                <tbody>
                    <tr><td><strong>Ünvanı</strong></td><td>xForgea3D</td></tr>
                    <tr><td><strong>Adres</strong></td><td>Ataşehir, İstanbul, Türkiye</td></tr>
                    <tr><td><strong>Telefon</strong></td><td>+90 530 111 22 33</td></tr>
                    <tr><td><strong>E-posta</strong></td><td>destek@xforgea3d.com</td></tr>
                    <tr><td><strong>Web Sitesi</strong></td><td>https://xforgea3d.com</td></tr>
                </tbody>
            </table>

            <h3>1.2. ALICI BİLGİLERİ</h3>
            <p>
                Tüketici, xforgea3d.com adresinden sipariş veren kişidir. Alıcının sipariş esnasında beyan ettiği ad-soyad, adres, telefon ve e-posta bilgileri esas alınır.
            </p>

            <h2>MADDE 2 - KONU</h2>
            <p>
                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait xforgea3d.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>

            <h2>MADDE 3 - SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</h2>
            <p>
                Malın/Ürünün türü, miktarı, marka/modeli, rengi, adedi, satış bedeli ve ödeme şekli siparişin onaylandığı andaki bilgilerden oluşmaktadır. Ürünlerin temel özellikleri, ölçüleri ve görselleri ürün sayfasında belirtilmiştir. xForgea3D, 3D baskı teknolojisiyle üretilen figür, aksesuar, araç parçası ve dekoratif ürünler sunmaktadır.
            </p>

            <h2>MADDE 4 - FİYAT VE ÖDEME KOŞULLARI</h2>
            <ul>
                <li>Ürün fiyatları, KDV dahil olarak web sitesinde belirtilmiştir.</li>
                <li>Ödeme; kredi kartı, banka kartı veya havale/EFT yöntemleriyle yapılabilir.</li>
                <li>Kredi kartıyla yapılan ödemelerde, ALICI&apos;nın kartının bankanın taksit imkanlarına bağlı olarak taksitli ödeme seçeneği sunulabilir.</li>
                <li>Sipariş toplamına kargo ücreti eklenebilir; kargo tutarı sipariş özetinde açıkça gösterilir.</li>
                <li>Kampanya ve indirim dönemlerinde fiyatlar değişiklik gösterebilir; sipariş anındaki fiyat geçerlidir.</li>
            </ul>

            <h2>MADDE 5 - TESLİMAT KOŞULLARI</h2>
            <ul>
                <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşuluyla, sipariş onayından itibaren genellikle <strong>3-7 iş günü</strong> içerisinde kargoya verilir.</li>
                <li>Teslimat, ALICI&apos;nın sipariş sırasında belirttiği adrese anlaşmalı kargo firması aracılığıyla yapılır.</li>
                <li>Kargo takip numarası, sipariş kargoya verildiğinde ALICI&apos;ya e-posta ve site içi bildirim ile iletilir.</li>
                <li>Sözleşme konusu ürün, ALICI&apos;dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.</li>
                <li>Teslimat sırasında kargo paketinde hasar görülmesi halinde, kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturulması zorunludur.</li>
            </ul>

            <h2>MADDE 6 - ALICI&apos;NIN HAK VE YÜKÜMLÜLÜKLERİ</h2>
            <ul>
                <li>ALICI, sipariş verirken doğru ve eksiksiz bilgi vermekle yükümlüdür.</li>
                <li>ALICI, sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul ve beyan eder.</li>
                <li>ALICI, ürünü teslim aldıktan sonra cayma hakkı süresi (14 gün) boyunca ürünü olağan inceleme sınırlarını aşmayacak şekilde kullanabilir.</li>
                <li>ALICI, iade sürecini web sitesi üzerinden &quot;Siparişlerim &gt; İade Talebi Oluştur&quot; bölümünden başlatabilir veya destek@xforgea3d.com adresine yazılı bildirimde bulunabilir.</li>
            </ul>

            <h2>MADDE 7 - GENEL HÜKÜMLER</h2>
            <ul>
                <li>
                    ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
                </li>
                <li>
                    Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI&apos;nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler kısmında belirtilen süre zarfında ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
                </li>
                <li>
                    SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleriyle birlikte teslim edilmesinden sorumludur.
                </li>
            </ul>

            <h2>MADDE 8 - CAYMA HAKKI (14 GÜN İADE HAKKI)</h2>
            <p>
                ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren <strong>14 (on dört) gün</strong> içerisinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.
            </p>
            <p>
                Cayma hakkının kullanımı için bu süre içinde SATICI&apos;ya web sitesi üzerinden iade talebi oluşturulması veya yukarıda belirtilen e-posta adresi üzerinden yazılı bildirimde bulunulması şarttır.
            </p>
            <p>
                Cayma hakkı süresinin belirlenmesinde; tek sipariş olarak verilen ancak ayrı ayrı teslim edilen ürünlerde son ürünün teslim tarihi esas alınır.
            </p>

            <h2>MADDE 9 - CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER</h2>
            <p>
                Aşağıdaki durumlarda ALICI cayma hakkını kullanamazlar:
            </p>
            <ul>
                <li>Tüketicinin özel istek ve talepleri uyarınca üretilen, kişiye özel boyut, renk, yazı veya tasarımla hazırlanan <strong>(Custom - Özel 3D Baskı)</strong> ürünlerde cayma hakkı kullanılamaz.</li>
                <li>Ambalajı açılmış, kullanılmış veya hasar görmüş ürünlerde cayma hakkı kullanılamaz.</li>
                <li>Standart ölçü ve renklerde üretilmiş katalog ürünlerinde 14 günlük iade hakkı tam olarak geçerlidir.</li>
            </ul>

            <h2>MADDE 10 - UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
            <p>
                İşbu sözleşmeden doğan uyuşmazlıklarda, Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. Taraflar, uyuşmazlıkların çözümünde <strong>İstanbul Mahkemeleri ve İcra Daireleri</strong>&apos;nin yetkili olduğunu kabul eder.
            </p>
            <p>
                Sanayi ve Ticaret Bakanlığı tarafından ilan edilen değere kadar olan uyuşmazlıklarda İl veya İlçe Tüketici Hakem Heyetleri, bu değeri aşan uyuşmazlıklarda Tüketici Mahkemeleri görevlidir.
            </p>

            <h2>MADDE 11 - YÜRÜRLÜK</h2>
            <p>
                ALICI, siparişini onaylamadan önce işbu sözleşmenin tüm koşullarını okuduğunu, anladığını ve kabul ettiğini onaylar. Sipariş onayı ile birlikte sözleşme yürürlüğe girer.
            </p>
        </div>
    )
}
