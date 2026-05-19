import { z } from 'zod'

const trErrorMap: z.ZodErrorMap = (issue, ctx) => {
   switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
         if (issue.expected === 'string') return { message: 'Metin girilmelidir' }
         if (issue.expected === 'number') return { message: 'Sayi girilmelidir' }
         if (issue.expected === 'boolean') return { message: 'Evet/Hayir secilmelidir' }
         if (issue.received === 'undefined') return { message: 'Bu alan zorunludur' }
         return { message: `Beklenen: ${issue.expected}, gelen: ${issue.received}` }

      case z.ZodIssueCode.too_small:
         if (issue.type === 'string') {
            if (issue.minimum === 1) return { message: 'Bu alan zorunludur' }
            return { message: `En az ${issue.minimum} karakter girilmelidir` }
         }
         if (issue.type === 'number') return { message: `Deger en az ${issue.minimum} olmalidir` }
         if (issue.type === 'array') return { message: `En az ${issue.minimum} oge secilmelidir` }
         return { message: `Deger cok kucuk` }

      case z.ZodIssueCode.too_big:
         if (issue.type === 'string') return { message: `En fazla ${issue.maximum} karakter girilebilir` }
         if (issue.type === 'number') return { message: `Deger en fazla ${issue.maximum} olmalidir` }
         if (issue.type === 'array') return { message: `En fazla ${issue.maximum} oge secilebilir` }
         return { message: `Deger cok buyuk` }

      case z.ZodIssueCode.invalid_string:
         if (issue.validation === 'email') return { message: 'Gecerli bir e-posta adresi giriniz' }
         if (issue.validation === 'url') return { message: 'Gecerli bir URL giriniz' }
         return { message: 'Gecersiz format' }

      case z.ZodIssueCode.invalid_enum_value:
         return { message: `Gecerli bir secenek seciniz` }

      case z.ZodIssueCode.custom:
         return { message: ctx.defaultError }

      default:
         return { message: ctx.defaultError }
   }
}

z.setErrorMap(trErrorMap)
