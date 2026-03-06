'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, GripVertical, Eye, EyeOff, Pencil, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface NavItem {
   id: string
   label: string
   href: string
   section: string
   sortOrder: number
   isVisible: boolean
   icon: string | null
   badge: string | null
}

const SECTION_LABELS: Record<string, string> = {
   main: 'Ana Menü',
   mobile: 'Mobil Menü',
   footer: 'Alt Menü',
}

export default function NavItemsPage() {
   const router = useRouter()
   const [items, setItems] = useState<NavItem[]>([])
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [deleteOpen, setDeleteOpen] = useState(false)
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

   // New item form
   const [showAdd, setShowAdd] = useState(false)
   const [newLabel, setNewLabel] = useState('')
   const [newHref, setNewHref] = useState('')
   const [newSection, setNewSection] = useState('main')
   const [newIcon, setNewIcon] = useState('')
   const [newBadge, setNewBadge] = useState('')

   // Edit inline
   const [editId, setEditId] = useState<string | null>(null)
   const [editLabel, setEditLabel] = useState('')
   const [editHref, setEditHref] = useState('')
   const [editIcon, setEditIcon] = useState('')
   const [editBadge, setEditBadge] = useState('')

   const fetchItems = async () => {
      try {
         const res = await fetch('/api/nav-items')
         if (res.ok) {
            const data = await res.json()
            setItems(data)
         }
      } catch {
         toast.error('Navbar verileri yuklenemedi')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => { fetchItems() }, [])

   const handleAdd = async () => {
      if (!newLabel || !newHref) {
         toast.error('Etiket ve link zorunlu')
         return
      }
      try {
         setSaving(true)
         const res = await fetch('/api/nav-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               label: newLabel,
               href: newHref,
               section: newSection,
               sortOrder: items.filter(i => i.section === newSection).length,
               icon: newIcon || null,
               badge: newBadge || null,
            }),
         })
         if (!res.ok) throw new Error()
         setNewLabel('')
         setNewHref('')
         setNewIcon('')
         setNewBadge('')
         setShowAdd(false)
         await fetchItems()
         toast.success('Menü öğesi eklendi')
      } catch {
         toast.error('Bir hata oluştu')
      } finally {
         setSaving(false)
      }
   }

   const handleDelete = async () => {
      if (!deleteTarget) return
      try {
         setSaving(true)
         const res = await fetch(`/api/nav-items/${deleteTarget}`, { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme başarısız')
         await fetchItems()
         toast.success('Menü öğesi silindi')
      } catch {
         toast.error('Bir hata oluştu')
      } finally {
         setSaving(false)
         setDeleteOpen(false)
         setDeleteTarget(null)
      }
   }

   const handleToggleVisibility = async (item: NavItem) => {
      try {
         const res = await fetch(`/api/nav-items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isVisible: !item.isVisible }),
         })
         if (!res.ok) throw new Error('Güncelleme başarısız')
         await fetchItems()
         toast.success(item.isVisible ? 'Gizlendi' : 'Gösterildi')
      } catch {
         toast.error('Bir hata oluştu')
      }
   }

   const handleSaveEdit = async () => {
      if (!editId) return
      try {
         setSaving(true)
         const res = await fetch(`/api/nav-items/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               label: editLabel,
               href: editHref,
               icon: editIcon || null,
               badge: editBadge || null,
            }),
         })
         if (!res.ok) throw new Error('Güncelleme başarısız')
         setEditId(null)
         await fetchItems()
         toast.success('Güncellendi')
      } catch {
         toast.error('Bir hata oluştu')
      } finally {
         setSaving(false)
      }
   }

   const handleMoveUp = async (item: NavItem, sectionItems: NavItem[]) => {
      const idx = sectionItems.findIndex(i => i.id === item.id)
      if (idx <= 0) return
      const updated = sectionItems.map((si, i) => ({
         id: si.id,
         sortOrder: i === idx ? idx - 1 : i === idx - 1 ? idx : i,
         isVisible: si.isVisible,
      }))
      try {
         const res = await fetch('/api/nav-items', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updated }),
         })
         if (!res.ok) throw new Error('Sıralama başarısız')
         await fetchItems()
      } catch {
         toast.error('Sıralama hatası')
      }
   }

   const handleMoveDown = async (item: NavItem, sectionItems: NavItem[]) => {
      const idx = sectionItems.findIndex(i => i.id === item.id)
      if (idx >= sectionItems.length - 1) return
      const updated = sectionItems.map((si, i) => ({
         id: si.id,
         sortOrder: i === idx ? idx + 1 : i === idx + 1 ? idx : i,
         isVisible: si.isVisible,
      }))
      try {
         const res = await fetch('/api/nav-items', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updated }),
         })
         if (!res.ok) throw new Error('Sıralama başarısız')
         await fetchItems()
      } catch {
         toast.error('Sıralama hatası')
      }
   }

   const sections = ['main', 'mobile', 'footer']

   if (loading) {
      return (
         <div className="my-6 flex items-center justify-center h-32 text-muted-foreground">
            Yükleniyor...
         </div>
      )
   }

   return (
      <>
         <AlertModal
            isOpen={deleteOpen}
            onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
            onConfirm={handleDelete}
            loading={saving}
         />

         <div className="my-6 space-y-6">
            <div className="flex items-center justify-between">
               <Heading
                  title={`Navbar Yönetimi (${items.length})`}
                  description="Mağaza navigasyonunu tek yerden yönetin. Değişiklikler anında frontend'e yansır."
               />
               <Button onClick={() => setShowAdd(!showAdd)}>
                  <Plus className="mr-2 h-4" /> Yeni Öğe
               </Button>
            </div>
            <Separator />

            {/* Add new item form */}
            {showAdd && (
               <div className="border rounded-xl p-4 space-y-3 bg-accent/30">
                  <h3 className="font-semibold text-sm">Yeni Menü Öğesi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="space-y-1">
                        <label className="text-xs font-medium">Etiket *</label>
                        <Input
                           placeholder="Ürünler"
                           value={newLabel}
                           onChange={e => setNewLabel(e.target.value)}
                           disabled={saving}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium">Link *</label>
                        <Input
                           placeholder="/products"
                           value={newHref}
                           onChange={e => setNewHref(e.target.value)}
                           disabled={saving}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium">Bölüm</label>
                        <Select value={newSection} onValueChange={setNewSection}>
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="main">Ana Menü</SelectItem>
                              <SelectItem value="mobile">Mobil Menü</SelectItem>
                              <SelectItem value="footer">Alt Menü</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium">Rozet</label>
                        <Input
                           placeholder="Yeni"
                           value={newBadge}
                           onChange={e => setNewBadge(e.target.value)}
                           disabled={saving}
                        />
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button size="sm" onClick={handleAdd} disabled={saving}>
                        <Plus className="h-3 w-3 mr-1" /> Ekle
                     </Button>
                     <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                        İptal
                     </Button>
                  </div>
               </div>
            )}

            {/* Section-by-section display */}
            {sections.map(section => {
               const sectionItems = items.filter(i => i.section === section)
               if (sectionItems.length === 0) return null

               return (
                  <div key={section} className="space-y-3">
                     <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {SECTION_LABELS[section]} ({sectionItems.length})
                     </h3>
                     <div className="space-y-1.5">
                        {sectionItems.map((item, idx) => (
                           <div
                              key={item.id}
                              className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 transition-all ${
                                 !item.isVisible ? 'opacity-50 bg-muted/30' : 'bg-card'
                              }`}
                           >
                              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                              {editId === item.id ? (
                                 <>
                                    <Input
                                       value={editLabel}
                                       onChange={e => setEditLabel(e.target.value)}
                                       className="h-8 w-32"
                                    />
                                    <Input
                                       value={editHref}
                                       onChange={e => setEditHref(e.target.value)}
                                       className="h-8 w-40"
                                    />
                                    <Input
                                       value={editBadge}
                                       onChange={e => setEditBadge(e.target.value)}
                                       placeholder="Rozet"
                                       className="h-8 w-20"
                                    />
                                    <Button size="sm" variant="ghost" onClick={handleSaveEdit} disabled={saving}>
                                       <Check className="h-3.5 w-3.5 text-green-500" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                                       <X className="h-3.5 w-3.5" />
                                    </Button>
                                 </>
                              ) : (
                                 <>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{item.label}</span>
                                          {item.badge && (
                                             <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-500">
                                                {item.badge}
                                             </span>
                                          )}
                                       </div>
                                       <span className="text-xs text-muted-foreground font-mono">{item.href}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                       {/* Move up/down */}
                                       <Button
                                          size="sm" variant="ghost" className="h-7 w-7 p-0"
                                          disabled={idx === 0}
                                          onClick={() => handleMoveUp(item, sectionItems)}
                                       >
                                          <span className="text-xs">↑</span>
                                       </Button>
                                       <Button
                                          size="sm" variant="ghost" className="h-7 w-7 p-0"
                                          disabled={idx === sectionItems.length - 1}
                                          onClick={() => handleMoveDown(item, sectionItems)}
                                       >
                                          <span className="text-xs">↓</span>
                                       </Button>

                                       {/* Toggle visibility */}
                                       <Button
                                          size="sm" variant="ghost" className="h-7 w-7 p-0"
                                          onClick={() => handleToggleVisibility(item)}
                                       >
                                          {item.isVisible
                                             ? <Eye className="h-3.5 w-3.5 text-green-500" />
                                             : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                          }
                                       </Button>

                                       {/* Edit */}
                                       <Button
                                          size="sm" variant="ghost" className="h-7 w-7 p-0"
                                          onClick={() => {
                                             setEditId(item.id)
                                             setEditLabel(item.label)
                                             setEditHref(item.href)
                                             setEditIcon(item.icon || '')
                                             setEditBadge(item.badge || '')
                                          }}
                                       >
                                          <Pencil className="h-3.5 w-3.5" />
                                       </Button>

                                       {/* Delete */}
                                       <Button
                                          size="sm" variant="ghost" className="h-7 w-7 p-0"
                                          onClick={() => { setDeleteTarget(item.id); setDeleteOpen(true) }}
                                       >
                                          <Trash className="h-3.5 w-3.5 text-destructive" />
                                       </Button>
                                    </div>
                                 </>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )
            })}

            {items.length === 0 && (
               <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Henüz menü öğesi eklenmemiş.</p>
                  <p className="text-xs mt-1">Yukarıdaki "Yeni Öğe" butonuyla başlayın.</p>
               </div>
            )}
         </div>
      </>
   )
}
