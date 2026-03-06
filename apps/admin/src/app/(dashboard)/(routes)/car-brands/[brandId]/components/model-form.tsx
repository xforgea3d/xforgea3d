'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Sparkles, Loader2, Car, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface CarModel {
   id: string
   name: string
   slug: string
   imageUrl: string | null
   yearRange: string | null
}

interface ModelFormProps {
   brandId: string
   brandName: string
   models: CarModel[]
}

function slugify(text: string) {
   return text
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[şŞ]/g, 's')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[öÖ]/g, 'o')
      .replace(/[ıİ]/g, 'i')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
}

export const ModelForm: React.FC<ModelFormProps> = ({ brandId, brandName, models }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [generatingId, setGeneratingId] = useState<string | null>(null)
   const [deleteOpen, setDeleteOpen] = useState(false)
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
   const [uploadingId, setUploadingId] = useState<string | null>(null)

   // New model form
   const [newName, setNewName] = useState('')
   const [newSlug, setNewSlug] = useState('')
   const [newYear, setNewYear] = useState('')
   const [newImageUrl, setNewImageUrl] = useState('')

   const handleAddModel = async () => {
      if (!newName || !newSlug) {
         toast.error('Model adı ve slug zorunlu')
         return
      }
      try {
         setLoading(true)
         const res = await fetch(`/api/car-brands/${brandId}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name: newName,
               slug: newSlug,
               yearRange: newYear || null,
               imageUrl: newImageUrl || null,
            }),
         })
         if (!res.ok) throw new Error(await res.text())
         setNewName('')
         setNewSlug('')
         setNewYear('')
         setNewImageUrl('')
         router.refresh()
         toast.success('Model eklendi.')
      } catch (e: any) {
         toast.error('Hata: ' + (e?.message || 'Bilinmeyen'))
      } finally {
         setLoading(false)
      }
   }

   const handleDeleteModel = async () => {
      if (!deleteTarget) return
      try {
         setLoading(true)
         await fetch(`/api/car-brands/${brandId}/models/${deleteTarget}`, { method: 'DELETE' })
         router.refresh()
         toast.success('Model silindi.')
      } catch {
         toast.error('Bir hata oluştu.')
      } finally {
         setLoading(false)
         setDeleteOpen(false)
         setDeleteTarget(null)
      }
   }

   const handleUploadImage = async (modelId: string, file: File) => {
      try {
         setUploadingId(modelId)
         const formData = new FormData()
         formData.append('file', file)
         const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
         if (!uploadRes.ok) throw new Error('Upload failed')
         const { url } = await uploadRes.json()

         await fetch(`/api/car-brands/${brandId}/models/${modelId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: url }),
         })
         router.refresh()
         toast.success('Görsel yüklendi!')
      } catch (e: any) {
         toast.error('Upload hatası: ' + (e?.message || ''))
      } finally {
         setUploadingId(null)
      }
   }

   const handleGenerateImage = async (model: CarModel) => {
      try {
         setGeneratingId(model.id)
         const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               prompt: `${brandName} ${model.name} ${model.yearRange || ''} otomobil, stüdyo çekimi, profesyonel araç fotoğrafı`,
               context: 'car-model',
            }),
         })

         if (!res.ok) throw new Error(await res.text())
         const { url } = await res.json()

         await fetch(`/api/car-brands/${brandId}/models/${model.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: url }),
         })

         router.refresh()
         toast.success('AI görsel oluşturuldu!')
      } catch (err: any) {
         toast.error(`Görsel hatası: ${err.message || 'Bilinmeyen hata'}`)
      } finally {
         setGeneratingId(null)
      }
   }

   return (
      <>
         <AlertModal
            isOpen={deleteOpen}
            onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
            onConfirm={handleDeleteModel}
            loading={loading}
         />

         <Heading title={`Modeller (${models.length})`} description={`${brandName} araç modellerini yönetin`} />
         <Separator />

         {/* Add new model */}
         <div className="border rounded-xl p-4 bg-muted/20 space-y-4">
            <h3 className="text-sm font-semibold">Yeni Model Ekle</h3>
            <div className="flex items-end gap-3 flex-wrap">
               <div className="space-y-1">
                  <label className="text-xs font-medium">Model Adı *</label>
                  <Input
                     placeholder="3 Serisi"
                     value={newName}
                     onChange={e => {
                        setNewName(e.target.value)
                        setNewSlug(slugify(e.target.value))
                     }}
                     disabled={loading}
                     className="w-44"
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-medium">Slug *</label>
                  <Input
                     placeholder="3-serisi"
                     value={newSlug}
                     onChange={e => setNewSlug(e.target.value)}
                     disabled={loading}
                     className="w-36"
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-medium">Yıl Aralığı</label>
                  <Input
                     placeholder="2019-2024"
                     value={newYear}
                     onChange={e => setNewYear(e.target.value)}
                     disabled={loading}
                     className="w-32"
                  />
               </div>
               <Button onClick={handleAddModel} disabled={loading} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Ekle
               </Button>
            </div>
            {/* Image upload for new model */}
            <div className="space-y-1">
               <label className="text-xs font-medium">Görsel (opsiyonel)</label>
               <ImageUpload
                  value={newImageUrl ? [newImageUrl] : []}
                  disabled={loading}
                  onChange={(url) => setNewImageUrl(url)}
                  onRemove={() => setNewImageUrl('')}
               />
            </div>
         </div>

         {/* Model list */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {models.map(model => (
               <div key={model.id} className="border rounded-xl overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-40 bg-muted flex items-center justify-center">
                     {model.imageUrl ? (
                        <Image
                           src={model.imageUrl}
                           alt={model.name}
                           fill
                           className="object-contain p-2"
                           sizes="300px"
                        />
                     ) : (
                        <Car className="h-12 w-12 text-muted-foreground/30" />
                     )}
                  </div>
                  {/* Info */}
                  <div className="p-3 space-y-2">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="font-semibold text-sm">{model.name}</h4>
                           {model.yearRange && (
                              <span className="text-xs text-muted-foreground">{model.yearRange}</span>
                           )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{model.slug}</span>
                     </div>
                     <div className="flex gap-1.5">
                        {/* Upload image */}
                        <label className="flex-1">
                           <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                 const file = e.target.files?.[0]
                                 if (file) handleUploadImage(model.id, file)
                                 e.target.value = ''
                              }}
                              disabled={uploadingId === model.id}
                           />
                           <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              disabled={uploadingId === model.id}
                              asChild
                           >
                              <span>
                                 {uploadingId === model.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                 ) : (
                                    <Upload className="h-3 w-3 mr-1" />
                                 )}
                                 Yükle
                              </span>
                           </Button>
                        </label>
                        {/* AI Generate */}
                        <Button
                           size="sm"
                           variant="outline"
                           className="flex-1 text-xs"
                           disabled={generatingId === model.id}
                           onClick={() => handleGenerateImage(model)}
                        >
                           {generatingId === model.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                           ) : (
                              <Sparkles className="h-3 w-3 mr-1" />
                           )}
                           AI
                        </Button>
                        {/* Delete */}
                        <Button
                           size="sm"
                           variant="destructive"
                           className="text-xs px-2"
                           onClick={() => { setDeleteTarget(model.id); setDeleteOpen(true) }}
                        >
                           <Trash className="h-3 w-3" />
                        </Button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </>
   )
}
