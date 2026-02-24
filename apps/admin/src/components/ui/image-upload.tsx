'use client'

import { Button } from '@/components/ui/button'
import { ImagePlus, Trash, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface ImageUploadProps {
   disabled?: boolean
   onChange: (value: string) => void
   onRemove: (value: string) => void
   value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
   disabled,
   onChange,
   onRemove,
   value,
}) => {
   const [isMounted, setIsMounted] = useState(false)
   const [isUploading, setIsUploading] = useState(false)
   const inputRef = useRef<HTMLInputElement>(null)

   useEffect(() => {
      setIsMounted(true)
   }, [])

   const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
         setIsUploading(true)
         const file = event.target.files?.[0]
         if (!file) return

         const fileExt = file.name.split('.').pop()
         const fileName = `${uuidv4()}.${fileExt}`
         const filePath = `uploads/${fileName}`

         const { error: uploadError, data } = await supabase.storage
            .from('ecommerce')
            .upload(filePath, file)

         if (uploadError) {
            throw uploadError
         }

         const { data: { publicUrl } } = supabase.storage
            .from('ecommerce')
            .getPublicUrl(filePath)

         onChange(publicUrl)
      } catch (error) {
         console.error('Error uploading image:', error)
         alert('Failed to upload image. Make sure the "ecommerce" bucket exists and is public.')
      } finally {
         setIsUploading(false)
         if (inputRef.current) {
            inputRef.current.value = ''
         }
      }
   }

   if (!isMounted) {
      return null
   }

   return (
      <div>
         <div className="mb-4 flex items-center gap-4">
            {value.map((url) => (
               <div
                  key={url}
                  className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
               >
                  <div className="z-10 absolute top-2 right-2">
                     <Button
                        type="button"
                        onClick={() => onRemove(url)}
                        variant="destructive"
                        size="sm"
                     >
                        <Trash className="h-4" />
                     </Button>
                  </div>
                  <Image
                     fill
                     sizes="(min-width: 1000px) 30vw, 50vw"
                     className="object-cover"
                     alt="Image"
                     src={url}
                  />
               </div>
            ))}
         </div>

         <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef}
            onChange={onUpload}
            disabled={disabled || isUploading}
         />

         <Button
            type="button"
            disabled={disabled || isUploading}
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            className="flex gap-2"
         >
            {isUploading ? (
               <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
               <ImagePlus className="h-4 w-4" />
            )}
            <p>{isUploading ? 'Uploading...' : 'Upload an Image'}</p>
         </Button>
      </div>
   )
}

export default ImageUpload
