import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Hr,
   Html,
   Img,
   Link,
   Preview,
   Section,
   Tailwind,
   Text,
} from '@react-email/components'
import * as React from 'react'

interface ReviewReminderEmailProps {
   userName?: string
   orderNumber?: string
   products: Array<{
      title: string
      image?: string
      productId: string
   }>
   storefrontUrl: string
}

export const ReviewReminderEmail = ({
   userName,
   orderNumber = '',
   products = [],
   storefrontUrl = '',
}: ReviewReminderEmailProps) => {
   const previewText = `Siparis #${orderNumber} teslim edildi! Urunlerinizi degerlendirin.`

   return (
      <Html>
         <Head />
         <Preview>{previewText}</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans">
               <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                  <Section className="mt-[32px] text-center">
                     <Text className="text-[40px] leading-none">&#11088;</Text>
                  </Section>

                  <Heading className="text-black text-[22px] font-bold text-center p-0 my-[20px] mx-0">
                     Siparissiniz teslim edildi!
                  </Heading>

                  {userName && (
                     <Text className="text-black text-[14px] leading-[24px]">
                        Merhaba {userName},
                     </Text>
                  )}

                  <Text className="text-black text-[14px] leading-[24px]">
                     Siparis <strong>#{orderNumber}</strong> basariyla teslim edildi.
                     Urunlerimizden memnun kaldiginizi umuyoruz! Degerli
                     gorusleriniz hem bize hem de diger musterilerimize yardimci
                     olacaktir.
                  </Text>

                  <Section className="my-[16px]">
                     {products.map((product, i) => (
                        <div
                           key={i}
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 0',
                              borderBottom: '1px solid #eaeaea',
                           }}
                        >
                           {product.image && (
                              <Img
                                 src={product.image}
                                 alt={product.title}
                                 width="60"
                                 height="60"
                                 style={{
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                 }}
                              />
                           )}
                           <div style={{ flex: 1 }}>
                              <Text
                                 style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                 }}
                              >
                                 {product.title}
                              </Text>
                           </div>
                           <div>
                              <Button
                                 className="px-12 py-8 bg-[#f97316] rounded text-white text-[12px] font-semibold no-underline text-center"
                                 href={`${storefrontUrl}/products/${product.productId}#reviews`}
                              >
                                 Degerlendir
                              </Button>
                           </div>
                        </div>
                     ))}
                  </Section>

                  <Section className="bg-[#fff7ed] rounded-lg p-[16px] my-[16px] text-center">
                     <Text className="text-[#ea580c] text-[14px] font-bold m-0">
                        &#11088; Degerlendirmeniz bizim icin cok degerli!
                     </Text>
                     <Text className="text-[#9a3412] text-[12px] m-0 mt-[4px]">
                        Yorumlariniz sayesinde urunlerimizi daha iyi hale getiriyoruz.
                     </Text>
                  </Section>

                  <Section className="text-center mt-[24px] mb-[24px]">
                     <Button
                        className="px-20 py-12 bg-[#f97316] rounded text-white text-[14px] font-semibold no-underline text-center"
                        href={`${storefrontUrl}/profile/orders`}
                     >
                        Siparislerimi Gor
                     </Button>
                  </Section>

                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                  <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                     Bu e-posta siparisiniz teslim edildigi icin gonderilmistir.
                     Sorunuz varsa bize{' '}
                     <Link href="mailto:destek@xforgea3d.com" className="text-[#f97316]">
                        destek@xforgea3d.com
                     </Link>{' '}
                     adresinden ulasabilirsiniz.
                  </Text>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   )
}

export default ReviewReminderEmail
