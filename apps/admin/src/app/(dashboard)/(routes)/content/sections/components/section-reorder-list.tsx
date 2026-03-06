'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

type Section = {
    id: string
    key: string
    title_tr: string
    content_json: any
    is_enabled: boolean
    sort_order: number
}

export function SectionReorderList({ initialSections }: { initialSections: Section[] }) {
    const [sections, setSections] = useState(initialSections)
    const [saving, setSaving] = useState<string | null>(null)
    const [editing, setEditing] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editJson, setEditJson] = useState('')

    async function toggleEnabled(id: string, current: boolean) {
        setSaving(id)
        try {
            const res = await fetch(`/api/content/sections/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_enabled: !current }),
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) throw new Error('Güncelleme başarısız')
            setSections(s => s.map(x => x.id === id ? { ...x, is_enabled: !current } : x))
            toast.success('Güncellendi.')
        } finally {
            setSaving(null)
        }
    }

    async function move(id: string, dir: 'up' | 'down') {
        const idx = sections.findIndex(s => s.id === id)
        if (dir === 'up' && idx === 0) return
        if (dir === 'down' && idx === sections.length - 1) return
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1
        const next = [...sections]
            ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
        const reordered = next.map((s, i) => ({ ...s, sort_order: i }))
        setSections(reordered)
        const res = await fetch('/api/content/sections/reorder', {
            method: 'POST',
            body: JSON.stringify(reordered.map(s => ({ id: s.id, sort_order: s.sort_order }))),
            headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) toast.error('Sıralama kaydedilemedi')
    }

    function startEdit(s: Section) {
        setEditing(s.id)
        setEditTitle(s.title_tr)
        setEditJson(s.content_json ? JSON.stringify(s.content_json, null, 2) : '')
    }

    async function saveEdit(id: string) {
        setSaving(id)
        try {
            const res = await fetch(`/api/content/sections/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title_tr: editTitle,
                    content_json: editJson ? JSON.parse(editJson) : null,
                }),
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) throw new Error('Güncelleme başarısız')
            setSections(s => s.map(x => x.id === id
                ? { ...x, title_tr: editTitle, content_json: editJson ? JSON.parse(editJson) : null }
                : x
            ))
            setEditing(null)
            toast.success('Bölüm güncellendi.')
        } catch {
            toast.error('JSON geçersiz.')
        } finally {
            setSaving(null)
        }
    }

    return (
        <div className="space-y-3">
            {sections.map((s, idx) => (
                <div key={s.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                                <button disabled={idx === 0} onClick={() => move(s.id, 'up')} className="hover:opacity-60 disabled:opacity-20"><ChevronUpIcon className="h-4 w-4" /></button>
                                <button disabled={idx === sections.length - 1} onClick={() => move(s.id, 'down')} className="hover:opacity-60 disabled:opacity-20"><ChevronDownIcon className="h-4 w-4" /></button>
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{s.title_tr}</p>
                                <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={s.is_enabled ? 'default' : 'secondary'}>
                                {s.is_enabled ? 'Aktif' : 'Pasif'}
                            </Badge>
                            <Button size="sm" variant="outline" disabled={saving === s.id} onClick={() => toggleEnabled(s.id, s.is_enabled)}>
                                {s.is_enabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => editing === s.id ? setEditing(null) : startEdit(s)}>
                                {editing === s.id ? 'İptal' : 'Düzenle'}
                            </Button>
                        </div>
                    </div>

                    {editing === s.id && (
                        <div className="space-y-3 pt-2 border-t">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Başlık</label>
                                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">İçerik JSON</label>
                                <Textarea
                                    value={editJson}
                                    onChange={e => setEditJson(e.target.value)}
                                    rows={10}
                                    className="font-mono text-xs mt-1"
                                    placeholder='[{ "icon": "truck", "title": "...", "desc": "..." }]'
                                />
                            </div>
                            <Button size="sm" disabled={saving === s.id} onClick={() => saveEdit(s.id)}>
                                Kaydet
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            {sections.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Henüz bölüm oluşturulmadı.</p>
            )}
        </div>
    )
}
