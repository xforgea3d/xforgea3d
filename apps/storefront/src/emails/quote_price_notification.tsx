import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Hr,
   Html,
   Preview,
   Section,
   Tailwind,
   Text,
} from '@react-email/components'
import * as React from 'react'

interface QuotePriceNotificationProps {
   quoteNumber?: string
   partDescription?: string
   quotedPrice?: string
   adminNote?: string
   acceptUrl?: string
}

export default function QuotePriceNotification({
   quoteNumber = '0',
   partDescription = '',
   quotedPrice = '0',
   adminNote = '',
   acceptUrl = '',
}: QuotePriceNotificationProps) {
   const previewText = `Parça talebiniz #${quoteNumber} için fiyat belirlendi: ${quotedPrice} TL`

   return (
      <Html>
         <Head />
         <Preview>{previewText}</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans">
               <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                  <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                     Parça Talebiniz Fiyatlandırıldı
                  </Heading>
                  <Text className="text-black text-[14px] leading-[24px]">
                     Merhaba,
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px]">
                     <strong>#{quoteNumber}</strong> numaralı parça talebiniz için fiyat belirlenmiştir.
                  </Text>

                  <Section className="bg-[#f9f9f9] border border-solid border-[#eaeaea] rounded p-[16px] my-[16px]">
                     <Text className="text-[13px] text-[#666] m-0 mb-[4px]">Parça Açıklaması:</Text>
                     <Text className="text-[14px] text-black m-0 mb-[12px]">{partDescription}</Text>
                     <Text className="text-[13px] text-[#666] m-0 mb-[4px]">Belirlenen Fiyat:</Text>
                     <Text className="text-[20px] font-bold text-[#f97316] m-0">{quotedPrice} TL</Text>
                     {adminNote && (
                        <>
                           <Text className="text-[13px] text-[#666] m-0 mt-[12px] mb-[4px]">Not:</Text>
                           <Text className="text-[14px] text-black m-0">{adminNote}</Text>
                        </>
                     )}
                  </Section>

                  <Section className="text-center mt-[32px] mb-[32px]">
                     <Button
                        className="px-20 py-12 bg-[#f97316] rounded text-white text-[12px] font-semibold no-underline text-center"
                        href={acceptUrl}
                     >
                        Fiyatı Kabul Et ve Satın Al
                     </Button>
                  </Section>

                  <Text className="text-black text-[14px] leading-[24px]">
                     Fiyatı onayladığınızda sipariş oluşturulacak ve ödeme sayfasına yönlendirileceksiniz.
                  </Text>

                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                  <Text className="text-[#666666] text-[12px] leading-[24px]">
                     Bu e-posta xForgea3D parça talep sistemi tarafından gönderilmiştir.
                     Talepte bulunmadıysanız bu e-postayı görmezden gelebilirsiniz.
                  </Text>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   )
}
