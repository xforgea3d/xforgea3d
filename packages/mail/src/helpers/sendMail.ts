import getTransporter from './getTransporter'

interface SendMailOptions {
   name?: string
   to: string
   subject: string
   html: string
}

export default async function sendMail({ name, to, subject, html }: SendMailOptions) {
   const transporter = getTransporter()
   const from = name
      ? `${name} <${process.env.SMTP_USER || 'noreply@xforgea3d.com'}>`
      : process.env.SMTP_USER || 'noreply@xforgea3d.com'

   return transporter.sendMail({
      from,
      to,
      subject,
      html,
   })
}
