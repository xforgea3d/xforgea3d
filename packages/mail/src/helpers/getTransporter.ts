import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

export default function getTransporter() {
   if (transporter) return transporter

   transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
      },
   })

   return transporter
}
