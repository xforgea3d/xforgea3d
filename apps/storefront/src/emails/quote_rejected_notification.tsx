import {
   Body,
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

interface QuoteRejectedNotificationProps {
   quoteNumber?: string
   partDescription?: string
   adminNote?: string
}

export default function QuoteRejectedNotification({
   quoteNumber = '0',
   partDescription = '',
   adminNote = '',
}: QuoteRejectedNotificationProps) {
   const previewText = `Parça talebiniz #${quoteNumber} hakkında bilgilendirme`

   return (
      <Html>
         <Head />
         <Preview>{previewText}</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans">
               <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                  <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                     Parça Talebi Bilgilendirmesi
                  </Heading>
                  <Text className="text-black text-[14px] leading-[24px]">
                     Merhaba,
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px]">
                     <strong>#{quoteNumber}</strong> numaralı parça talebiniz maalesef karşılanamamaktadır.
                  </Text>

                  <Section className="bg-[#f9f9f9] border border-solid border-[#eaeaea] rounded p-[16px] my-[16px]">
                     <Text className="text-[13px] text-[#666] m-0 mb-[4px]">Parça Açıklaması:</Text>
                     <Text className="text-[14px] text-black m-0">{partDescription}</Text>
                     {adminNote && (
                        <>
                           <Text className="text-[13px] text-[#666] m-0 mt-[12px] mb-[4px]">Açıklama:</Text>
                           <Text className="text-[14px] text-black m-0">{adminNote}</Text>
                        </>
                     )}
                  </Section>

                  <Text className="text-black text-[14px] leading-[24px]">
                     Farklı bir parça talebi oluşturmak veya sorularınız için bizimle iletişime geçebilirsiniz.
                  </Text>

                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                  <Text className="text-[#666666] text-[12px] leading-[24px]">
                     Bu e-posta xForgea3D parça talep sistemi tarafından gönderilmiştir.
                  </Text>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   )
}
