'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AlertModalProps {
   isOpen: boolean
   onClose: () => void
   onConfirm: () => void
   loading: boolean
}

export const AlertModal: React.FC<AlertModalProps> = ({
   isOpen,
   onClose,
   onConfirm,
   loading,
}) => {
   const [isMounted, setIsMounted] = useState(false)

   useEffect(() => {
      setIsMounted(true)
   }, [])

   if (!isMounted) {
      return null
   }

   return (
      <Modal
         title="Emin misiniz?"
         description="Bu işlem geri alınamaz."
         isOpen={isOpen}
         onClose={onClose}
      >
         <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button disabled={loading} variant="outline" onClick={onClose}>
               İptal
            </Button>
            <Button
               disabled={loading}
               variant="destructive"
               onClick={onConfirm}
            >
               {loading ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     İşleniyor...
                  </>
               ) : (
                  'Devam Et'
               )}
            </Button>
         </div>
      </Modal>
   )
}
