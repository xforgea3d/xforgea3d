'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
} from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
   Plus,
   Trash2,
   Loader2,
   Car,
   Upload,
   Pencil,
} from 'lucide-react'
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
   const [deleteOpen, setDeleteOpen] = useState(false)
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
   const [uploadingId, setUploadingId] = useState<string | null>(null)

   // Add dialog
   const [addOpen, setAddOpen] = useState(false)
   const [newName, setNewName] = useState('')
   const [newSlug, setNewSlug] = useState('')
   const [newYear, setNewYear] = useState('')
   const [newImageUrl, setNewImageUrl] = useState('')

   // Edit dialog
   const [editOpen, setEditOpen] = useState(false)
   const [editModel, setEditModel] = useState<CarModel | null>(null)
   const [editName, setEditName] = useState('')
   const [editSlug, setEditSlug] = useState('')
   const [editYear, setEditYear] = useState('')

   const resetAddForm = () => {
      setNewName('')
      setNewSlug('')
      setNewYear('')
      setNewImageUrl('')
   }

   const openEditDialog = (model: CarModel) => {
      setEditModel(model)
      setEditName(model.name)
      setEditSlug(model.slug)
      setEditYear(model.yearRange || '')
      setEditOpen(true)
   }

   const handleAddModel = async () => {
      if (!newName) {
         toast.error('Model adı zorunlu')
         return
      }
      const slug = newSlug || slugify(newName)
      try {
         setLoading(true)
         const res = await fetch(`/api/car-brands/${brandId}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name: newName,
               slug,
               yearRange: newYear || null,
               imageUrl: newImageUrl || null,
            }),
         })
         if (!res.ok) throw new Error(await res.text())
         resetAddForm()
         setAddOpen(false)
         router.refresh()
         toast.success('Model eklendi.')
      } catch (e: any) {
         toast.error('Hata: ' + (e?.message || 'Bilinmeyen'))
      } finally {
         setLoading(false)
      }
   }

   const handleEditModel = async () => {
      if (!editModel || !editName) return
      try {
         setLoading(true)
         const res = await fetch(`/api/car-brands/${brandId}/models/${editModel.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name: editName,
               slug: editSlug || slugify(editName),
               yearRange: editYear || null,
            }),
         })
         if (!res.ok) throw new Error(await res.text())
         setEditOpen(false)
         setEditModel(null)
         router.refresh()
         toast.success('Model güncellendi.')
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
         const res = await fetch(`/api/car-brands/${brandId}/models/${deleteTarget}`, { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme başarısız')
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
      if (file.size > 5 * 1024 * 1024) {
         toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
         return
      }
      try {
         setUploadingId(modelId)
         const formData = new FormData()
         formData.append('file', file)
         const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
         if (!uploadRes.ok) throw new Error('Upload failed')
         const { url } = await uploadRes.json()

         const patchRes = await fetch(`/api/car-brands/${brandId}/models/${modelId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: url }),
         })
         if (!patchRes.ok) throw new Error('Güncelleme başarısız')
         router.refresh()
         toast.success('Görsel yüklendi!')
      } catch (e: any) {
         toast.error('Upload hatası: ' + (e?.message || ''))
      } finally {
         setUploadingId(null)
      }
   }

   return (
      <>
         {/* Delete confirmation */}
         <AlertModal
            isOpen={deleteOpen}
            onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
            onConfirm={handleDeleteModel}
            loading={loading}
         />

         {/* Add Model Dialog */}
         <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle>Yeni Model Ekle</DialogTitle>
                  <DialogDescription>{brandName} markasına yeni bir model ekleyin.</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-2">
                  <div className="space-y-2">
                     <Label htmlFor="model-name">Model Adı *</Label>
                     <Input
                        id="model-name"
                        placeholder="3 Serisi"
                        value={newName}
                        onChange={e => {
                           setNewName(e.target.value)
                           setNewSlug(slugify(e.target.value))
                        }}
                        disabled={loading}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="model-slug">Slug</Label>
                     <Input
                        id="model-slug"
                        placeholder="3-serisi"
                        value={newSlug}
                        onChange={e => setNewSlug(e.target.value)}
                        disabled={loading}
                        className="font-mono text-sm"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="model-year">Yıl Aralığı</Label>
                     <Input
                        id="model-year"
                        placeholder="2019-2024"
                        value={newYear}
                        onChange={e => setNewYear(e.target.value)}
                        disabled={loading}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Görsel (opsiyonel)</Label>
                     <ImageUpload
                        value={newImageUrl ? [newImageUrl] : []}
                        disabled={loading}
                        onChange={(url) => setNewImageUrl(url)}
                        onRemove={() => setNewImageUrl('')}
                     />
                     <p className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <span className="font-medium text-foreground block">📸 Araç Model Görseli:</span>
                        <span className="block">• Boyut: 800×500px (16:10 yatay)</span>
                        <span className="block">• Format: PNG (şeffaf veya beyaz arka plan)</span>
                        <span className="block">• Aracın 3/4 ön görünümü tercih edilir</span>
                        <span className="block">• Arka plan otomatik beyaza çevrilir</span>
                        <span className="block">• Tüm modellerde aynı açı önerilir</span>
                        <span className="block">• Maks. 5MB</span>
                     </p>
                  </div>
               </div>
               <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => { setAddOpen(false); resetAddForm() }} disabled={loading}>
                     İptal
                  </Button>
                  <Button onClick={handleAddModel} disabled={loading} className="gap-2">
                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                     Ekle
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Edit Model Dialog */}
         <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle>Modeli Düzenle</DialogTitle>
                  <DialogDescription>Model bilgilerini güncelleyin.</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-2">
                  <div className="space-y-2">
                     <Label htmlFor="edit-name">Model Adı *</Label>
                     <Input
                        id="edit-name"
                        value={editName}
                        onChange={e => {
                           setEditName(e.target.value)
                           setEditSlug(slugify(e.target.value))
                        }}
                        disabled={loading}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="edit-slug">Slug</Label>
                     <Input
                        id="edit-slug"
                        value={editSlug}
                        onChange={e => setEditSlug(e.target.value)}
                        disabled={loading}
                        className="font-mono text-sm"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="edit-year">Yıl Aralığı</Label>
                     <Input
                        id="edit-year"
                        value={editYear}
                        onChange={e => setEditYear(e.target.value)}
                        disabled={loading}
                     />
                  </div>
               </div>
               <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>
                     İptal
                  </Button>
                  <Button onClick={handleEditModel} disabled={loading} className="gap-2">
                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                     Kaydet
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Header with Add button */}
         <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
               {brandName} markasına ait {models.length} model
            </p>
            <Button onClick={() => setAddOpen(true)} className="gap-2">
               <Plus className="h-4 w-4" />
               Yeni Model Ekle
            </Button>
         </div>

         {/* Empty state */}
         {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed">
               <Car className="h-12 w-12 text-muted-foreground/30 mb-3" />
               <p className="text-sm text-muted-foreground">Henüz model eklenmemiş</p>
               <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => setAddOpen(true)}
               >
                  <Plus className="h-4 w-4" />
                  İlk modeli ekle
               </Button>
            </div>
         ) : (
            /* Model list */
            <div className="space-y-2">
               {models.map(model => (
                  <div
                     key={model.id}
                     className="group flex items-center gap-4 rounded-lg border bg-card p-3 hover:border-orange-500/40 transition-colors"
                  >
                     {/* Model image */}
                     <div className="relative w-28 h-20 bg-black rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {model.imageUrl ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img
                              src={model.imageUrl}
                              alt={model.name}
                              className="w-full h-full object-contain p-2"
                           />
                        ) : (
                           <Car className="h-8 w-8 text-white/15" />
                        )}

                        {/* Upload overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                           <label className="cursor-pointer">
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
                              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-white/20 hover:bg-white/30 transition-colors">
                                 {uploadingId === model.id ? (
                                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                                 ) : (
                                    <Upload className="h-3.5 w-3.5 text-white" />
                                 )}
                              </span>
                           </label>
                        </div>
                     </div>

                     {/* Model info */}
                     <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{model.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           {model.yearRange && (
                              <Badge variant="secondary" className="text-[11px]">
                                 {model.yearRange}
                              </Badge>
                           )}
                           <span className="text-[10px] text-muted-foreground font-mono">
                              {model.slug}
                           </span>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                           size="icon"
                           variant="ghost"
                           className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                           onClick={() => openEditDialog(model)}
                           title="Düzenle"
                        >
                           <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                           size="icon"
                           variant="ghost"
                           className="h-8 w-8 text-muted-foreground hover:text-destructive"
                           onClick={() => { setDeleteTarget(model.id); setDeleteOpen(true) }}
                           title="Sil"
                        >
                           <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </>
   )
}
