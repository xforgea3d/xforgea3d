/**
 * SMS Sending Module — Generic interface supporting multiple Turkish SMS providers.
 *
 * Environment variables:
 *   SMS_PROVIDER    — 'netgsm' | 'iletimerkezi' | 'twilio'
 *   SMS_API_KEY     — API key / auth token for the provider
 *   SMS_API_SECRET  — Secondary secret (Twilio Auth Token, İletiMerkezi password, etc.)
 *   SMS_SENDER      — Sender ID / header (defaults to 'xForgea3D')
 */

export async function sendSMS(phone: string, message: string): Promise<boolean> {
   const provider = process.env.SMS_PROVIDER as 'netgsm' | 'iletimerkezi' | 'twilio' | undefined
   const apiKey = process.env.SMS_API_KEY
   const apiSecret = process.env.SMS_API_SECRET
   const sender = process.env.SMS_SENDER || 'xForgea3D'

   if (!provider || !apiKey) {
      console.warn('[SMS] Provider not configured, skipping')
      return false
   }

   try {
      if (provider === 'netgsm') {
         // NetGSM XML API — https://www.netgsm.com.tr/dokuman/
         const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
   <header>
      <company dession="y">Netgsm</company>
      <usercode>${apiKey}</usercode>
      <password>${apiSecret}</password>
      <type>1:n</type>
      <msgheader>${sender}</msgheader>
   </header>
   <body>
      <msg><![CDATA[${message}]]></msg>
      <no>${phone}</no>
   </body>
</mainbody>`

         const res = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: xml,
         })

         const text = await res.text()
         // NetGSM returns codes starting with "00" or "01" for success
         if (text.startsWith('00') || text.startsWith('01')) {
            console.log(`[SMS:NetGSM] Sent to ${phone}`)
            return true
         }
         console.error(`[SMS:NetGSM] Failed: ${text}`)
         return false
      }

      if (provider === 'iletimerkezi') {
         // İletiMerkezi REST API — https://www.iletimerkezi.com/docs
         const res = await fetch('https://api.iletimerkezi.com/v1/send-sms/get/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               request: {
                  authentication: {
                     key: apiKey,
                     hash: apiSecret,
                  },
                  order: {
                     sender: sender,
                     message: {
                        text: message,
                        receipts: {
                           number: [phone],
                        },
                     },
                  },
               },
            }),
         })

         if (res.ok) {
            console.log(`[SMS:IletiMerkezi] Sent to ${phone}`)
            return true
         }
         const err = await res.text()
         console.error(`[SMS:IletiMerkezi] Failed: ${err}`)
         return false
      }

      if (provider === 'twilio') {
         // Twilio REST API
         const accountSid = apiKey
         const authToken = apiSecret
         const twilioPhone = process.env.SMS_TWILIO_FROM || sender

         const params = new URLSearchParams()
         params.append('To', phone)
         params.append('From', twilioPhone)
         params.append('Body', message)

         const res = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
               },
               body: params.toString(),
            }
         )

         if (res.ok) {
            console.log(`[SMS:Twilio] Sent to ${phone}`)
            return true
         }
         const err = await res.text()
         console.error(`[SMS:Twilio] Failed: ${err}`)
         return false
      }

      console.warn(`[SMS] Unknown provider: ${provider}`)
      return false
   } catch (error) {
      console.error('[SMS] Error sending SMS:', error)
      return false
   }
}

/**
 * Pre-built message templates for order status notifications.
 */
export const SMS_TEMPLATES = {
   shipped: (trackingNumber?: string) =>
      trackingNumber
         ? `xForgea3D: Siparisaniz kargoya verildi! Takip No: ${trackingNumber}. Bizi tercih ettiginiz icin tesekkurler.`
         : `xForgea3D: Siparisaniz kargoya verildi! Bizi tercih ettiginiz icin tesekkurler.`,
   delivered: () =>
      `xForgea3D: Siparisaniz teslim edildi! Degerlendirmeyi unutmayin. Bizi tercih ettiginiz icin tesekkurler.`,
} as const
