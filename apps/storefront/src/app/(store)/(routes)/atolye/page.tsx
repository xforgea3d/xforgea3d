'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    UploadCloudIcon,
    CheckCircleIcon,
    XCircleIcon,
    PaletteIcon,
    UserIcon,
    MapPinIcon,
    MessageSquareIcon,
    SparklesIcon,
    ArrowRightIcon,
    FileIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useUserContext } from '@/state/User'

interface Color {
    id: string
    name: string
    hex: string
}

interface FormState {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    notes: string
    selectedColor: string | null
    svgFile: File | null
}

const STEPS = ['Tasarım', 'Renk', 'Bilgiler', 'Gönder']

export default function AtolyePage() {
    const { user } = useUserContext()
    const [step, setStep] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [quoteNumber, setQuoteNumber] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [colors, setColors] = useState<Color[]>([])
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState<FormState>({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', notes: '',
        selectedColor: null, svgFile: null,
    })

    // Load colors from admin
    useEffect(() => {
        fetch('/api/custom-order/colors')
            .then(r => r.ok ? r.json() : [])
            .then(d => setColors(d))
            .catch(() => { })
    }, [])

    function handleFile(file: File | undefined) {
        if (!file) return
        if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
            toast.error('Lütfen bir SVG dosyası yükleyin.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dosya boyutu 5MB\'dan küçük olmalı.')
            return
        }
        setForm(f => ({ ...f, svgFile: file }))
        toast.success('SVG dosyası yüklendi!')
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    function set(key: keyof FormState, val: any) {
        setForm(f => ({ ...f, [key]: val }))
    }

    function canAdvance() {
        if (step === 0) return !!form.svgFile
        if (step === 1) return !!form.selectedColor
        if (step === 2) return form.firstName && form.lastName && form.email && form.phone && form.address && form.city
        return true
    }

    async function handleSubmit() {
        setLoading(true)
        try {
            const fd = new FormData()
            if (form.svgFile) fd.append('svg', form.svgFile)
            fd.append('data', JSON.stringify({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                address: form.address,
                city: form.city,
                notes: form.notes,
                colorId: form.selectedColor,
                colorName: colors.find(c => c.id === form.selectedColor)?.name,
            }))
            const res = await fetch('/api/custom-order', { method: 'POST', body: fd })
            if (!res.ok) throw new Error()
            const resData = await res.json()
            if (resData.number) setQuoteNumber(resData.number)
            setSubmitted(true)
        } catch {
            toast.error('Bir hata oluştu, tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-5 max-w-md mx-auto px-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                        <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Talebiniz Alındı!</h2>
                    {quoteNumber && (
                        <p className="text-sm font-mono text-muted-foreground">Talep No: #{quoteNumber}</p>
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                        Tasarımınızı inceledikten sonra <strong>{form.email}</strong> adresinize
                        fiyat teklifi ve tahmini üretim süresiyle birlikte dönüş yapacağız.
                        Bu genellikle <strong>24 saat</strong> içinde gerçekleşir.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button asChild className="rounded-full">
                            <a href="/">Ana Sayfaya Dön</a>
                        </Button>
                        {user && (
                            <Button asChild variant="outline" className="rounded-full">
                                <Link href="/profile/quote-requests">Taleplerime Git</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400 mb-4">
                    <SparklesIcon className="h-3 w-3" />
                    Atölye — Özel Tasarım
                </span>
                <h1 className="text-3xl font-black tracking-tight">Kendi Tasarımını Bask</h1>
                <p className="mt-2 text-muted-foreground">
                    SVG dosyanı yükle, renk seç, bilgilerini gir — fiyat teklifini en kısa sürede iletiyoruz.
                </p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-0 mb-10">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${i < step ? 'bg-orange-500 border-orange-500 text-white'
                                    : i === step ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                                        : 'border-neutral-300 dark:border-neutral-600 text-neutral-400'
                                }`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${i === step ? 'text-orange-500' : 'text-muted-foreground'}`}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mb-4 transition-all duration-500 ${i < step ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 0: SVG Upload */}
            {step === 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><UploadCloudIcon className="h-5 w-5 text-orange-500" /> SVG Tasarımını Yükle</h2>
                    <p className="text-sm text-muted-foreground">Sadece SVG formatı desteklenmektedir. Maksimum 5MB.</p>

                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-orange-500 bg-orange-500/5 scale-[1.01]'
                                : form.svgFile ? 'border-emerald-500 bg-emerald-500/5'
                                    : 'border-neutral-300 dark:border-neutral-700 hover:border-orange-400/60 hover:bg-orange-500/3'
                            }`}
                    >
                        <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden"
                            onChange={e => handleFile(e.target.files?.[0])} />

                        {form.svgFile ? (
                            <div className="space-y-2">
                                <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{form.svgFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(form.svgFile.size / 1024).toFixed(1)} KB</p>
                                <button onClick={e => { e.stopPropagation(); set('svgFile', null) }}
                                    className="text-xs text-red-500 hover:underline">Kaldır</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <UploadCloudIcon className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                                <div>
                                    <p className="font-semibold">Dosyayı buraya bırak</p>
                                    <p className="text-sm text-muted-foreground">veya tıklayarak seç</p>
                                </div>
                                <span className="inline-block text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg text-muted-foreground">SVG</span>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">💡 İpucu</p>
                        <p>Illustrator, Figma veya Inkscape&apos;ten dışa aktarılan SVG dosyaları en iyi sonucu verir.</p>
                        <p>Tasarımınızda metin varsa, önce outline/kontur haline getirin.</p>
                    </div>
                </div>
            )}

            {/* Step 1: Color */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><PaletteIcon className="h-5 w-5 text-orange-500" /> Renk Seç</h2>
                    <p className="text-sm text-muted-foreground">Filaman rengi seçin. Farklı bir renk istiyorsanız notlar bölümünde belirtin.</p>

                    {colors.length === 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {[
                                { id: 'white', name: 'Beyaz', hex: '#FFFFFF' },
                                { id: 'black', name: 'Siyah', hex: '#1a1a1a' },
                                { id: 'gray', name: 'Gri', hex: '#9ca3af' },
                                { id: 'red', name: 'Kırmızı', hex: '#ef4444' },
                                { id: 'blue', name: 'Mavi', hex: '#3b82f6' },
                                { id: 'orange', name: 'Turuncu', hex: '#f97316' },
                                { id: 'green', name: 'Yeşil', hex: '#22c55e' },
                                { id: 'yellow', name: 'Sarı', hex: '#eab308' },
                                { id: 'purple', name: 'Mor', hex: '#a855f7' },
                                { id: 'pink', name: 'Pembe', hex: '#ec4899' },
                                { id: 'silver', name: 'Gümüş', hex: '#C0C0C0' },
                                { id: 'gold', name: 'Altın', hex: '#FFD700' },
                            ].map(c => (
                                <button key={c.id} onClick={() => set('selectedColor', c.id)}
                                    className={`group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${form.selectedColor === c.id ? 'border-orange-500 scale-105' : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'}`}>
                                    <div className="w-10 h-10 rounded-full border border-black/10 shadow-sm"
                                        style={{ backgroundColor: c.hex }} />
                                    <span className="text-[10px] font-medium text-center leading-tight">{c.name}</span>
                                    {form.selectedColor === c.id && <CheckCircleIcon className="h-4 w-4 text-orange-500 absolute" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {colors.map(c => (
                                <button key={c.id} onClick={() => set('selectedColor', c.id)}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${form.selectedColor === c.id ? 'border-orange-500 scale-105' : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'}`}>
                                    <div className="w-10 h-10 rounded-full border border-black/10 shadow-sm"
                                        style={{ backgroundColor: c.hex }} />
                                    <span className="text-[10px] font-medium text-center leading-tight">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: User info */}
            {step === 2 && (
                <div className="space-y-5">
                    <h2 className="text-lg font-bold flex items-center gap-2"><UserIcon className="h-5 w-5 text-orange-500" /> Bilgilerini Gir</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Ad" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Ahmet" />
                        <Field label="Soyad" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Yılmaz" />
                    </div>
                    <Field label="E-posta" type="email" value={form.email} onChange={v => set('email', v)} placeholder="ahmet@ornek.com" />
                    <Field label="Telefon" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="+90 555 000 0000" />
                    <Field label="Adres" value={form.address} onChange={v => set('address', v)} placeholder="Mahalle, Cadde, No" />
                    <Field label="Şehir" value={form.city} onChange={v => set('city', v)} placeholder="İstanbul" />

                    <div>
                        <label className="text-sm font-semibold mb-1.5 block flex items-center gap-1.5">
                            <MessageSquareIcon className="h-3.5 w-3.5 text-orange-500" />
                            Ek Notlar (İsteğe Bağlı)
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            rows={4}
                            placeholder="Özel isteklerinizi, boyut tercihlerinizi, renk alternatiflerinizi veya eklemek istediğiniz her şeyi yazın..."
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="space-y-5">
                    <h2 className="text-lg font-bold">Özet & Gönder</h2>
                    <div className="rounded-2xl border bg-muted/20 divide-y">
                        <Row label="SVG Dosyası" value={form.svgFile?.name ?? '—'} icon={<FileIcon className="h-4 w-4" />} />
                        <Row label="Renk" icon={<PaletteIcon className="h-4 w-4" />}
                            value={
                                <span className="flex items-center gap-2">
                                    {colors.find(c => c.id === form.selectedColor) && (
                                        <span className="w-4 h-4 rounded-full border border-black/10 inline-block"
                                            style={{ backgroundColor: colors.find(c => c.id === form.selectedColor)?.hex ?? (form.selectedColor === 'white' ? '#fff' : '#000') }} />
                                    )}
                                    {colors.find(c => c.id === form.selectedColor)?.name ?? form.selectedColor}
                                </span>
                            }
                        />
                        <Row label="Ad Soyad" value={`${form.firstName} ${form.lastName}`} icon={<UserIcon className="h-4 w-4" />} />
                        <Row label="E-posta" value={form.email} icon={<MessageSquareIcon className="h-4 w-4" />} />
                        <Row label="Şehir" value={form.city} icon={<MapPinIcon className="h-4 w-4" />} />
                        {form.notes && <Row label="Notlar" value={form.notes} icon={<MessageSquareIcon className="h-4 w-4" />} />}
                    </div>

                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-orange-700 dark:text-orange-300">
                        <p className="font-semibold mb-1">📋 Nasıl İlerler?</p>
                        <ol className="space-y-1 list-decimal list-inside text-orange-600/80 dark:text-orange-300/80">
                            <li>Tasarımınızı inceliyoruz (genellikle 24 saat içinde)</li>
                            <li>Fiyat teklifi ve tahmini süreyi e-posta ile bildiriyoruz</li>
                            <li>Onay verirseniz üretime başlıyoruz</li>
                            <li>Hazır olunca kargoya verip takip numarasını paylaşıyoruz</li>
                        </ol>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t">
                {step > 0 ? (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-full px-6">
                        ← Geri
                    </Button>
                ) : <div />}

                {step < 3 ? (
                    <Button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canAdvance()}
                        className="rounded-full px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-[0_4px_16px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Devam Et <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-full px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
                    >
                        {loading ? (
                            <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                        ) : <SparklesIcon className="h-4 w-4 mr-2" />}
                        Teklif İste
                    </Button>
                )}
            </div>
        </div>
    )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <div>
            <label className="text-sm font-semibold mb-1.5 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
            />
        </div>
    )
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 px-4 py-3">
            <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 break-words">{value}</p>
            </div>
        </div>
    )
}
