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

interface AbandonedCartEmailProps {
   userName?: string
   products: Array<{
      title: string
      image?: string
      price: number
   }>
   cartUrl: string
}

export const AbandonedCartEmail = ({
   userName,
   products = [],
   cartUrl = '',
}: AbandonedCartEmailProps) => {
   const previewText = 'Sepetinizde ürünler sizi bekliyor!'

   return (
      <Html>
         <Head />
         <Preview>{previewText}</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans">
               <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                  <Section className="mt-[32px] text-center">
                     <Text className="text-[40px] leading-none">🛒</Text>
                  </Section>

                  <Heading className="text-black text-[22px] font-bold text-center p-0 my-[20px] mx-0">
                     Sepetinizde ürünler sizi bekliyor!
                  </Heading>

                  {userName && (
                     <Text className="text-black text-[14px] leading-[24px]">
                        Merhaba {userName},
                     </Text>
                  )}

                  <Text className="text-black text-[14px] leading-[24px]">
                     Sepetinize eklediğiniz ürünler hâlâ sizi bekliyor. Siparişinizi
                     tamamlamayı unutmayın!
                  </Text>

                  <Section className="my-[16px]">
                     {products.map((product, i) => (
                        <div
                           key={i}
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 0',
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
                           <div>
                              <Text
                                 style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                 }}
                              >
                                 {product.title}
                              </Text>
                              <Text
                                 style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    color: '#666',
                                 }}
                              >
                                 {product.price.toFixed(2)} TL
                              </Text>
                           </div>
                        </div>
                     ))}
                  </Section>

                  <Section className="bg-[#fff7ed] rounded-lg p-[16px] my-[16px] text-center">
                     <Text className="text-[#ea580c] text-[14px] font-bold m-0">
                        🎉 Siparişinizi 24 saat içinde tamamlayın, %10 indirim kazanın!
                     </Text>
                  </Section>

                  <Section className="text-center mt-[24px] mb-[24px]">
                     <Button
                        className="px-20 py-12 bg-[#f97316] rounded text-white text-[14px] font-semibold no-underline text-center"
                        href={cartUrl}
                     >
                        Sepetime Git
                     </Button>
                  </Section>

                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                  <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                     Bu e-posta sepetinizdeki ürünleri hatırlatmak için gönderilmiştir.
                     Sorunuz varsa bize{' '}
                     <Link href="mailto:destek@xforgea3d.com" className="text-[#f97316]">
                        destek@xforgea3d.com
                     </Link>{' '}
                     adresinden ulaşabilirsiniz.
                  </Text>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   )
}

export default AbandonedCartEmail
