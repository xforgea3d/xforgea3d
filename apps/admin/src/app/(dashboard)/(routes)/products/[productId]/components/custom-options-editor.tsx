import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface ColorOption {
    label: string
    hex: string
    price: number
}

export interface SizeOption {
    label: string
    price: number
}

export interface CustomOptionsData {
    colors: ColorOption[]
    sizes: SizeOption[]
    maxTextLength: number
    allowFileUpload: boolean
    basePriceAddition: number
}

interface CustomOptionsProps {
    value: string // JSON string
    onChange: (val: string) => void
    disabled?: boolean
}

export const CustomOptionsEditor = ({ value, onChange, disabled }: CustomOptionsProps) => {
    const [data, setData] = useState<CustomOptionsData>({
        colors: [],
        sizes: [],
        maxTextLength: 0,
        allowFileUpload: false,
        basePriceAddition: 0,
    })

    // Init from JSON
    useEffect(() => {
        if (value) {
            try {
                const parsed = JSON.parse(value)
                setData({
                    colors: Array.isArray(parsed.colors) ? parsed.colors : [],
                    sizes: Array.isArray(parsed.sizes) ? parsed.sizes : [],
                    maxTextLength: parsed.maxTextLength || 0,
                    allowFileUpload: parsed.allowFileUpload || false,
                    basePriceAddition: parsed.basePriceAddition || 0,
                })
            } catch {
                console.warn('[custom-options] Invalid custom options JSON')
            }
        }
    }, [value])

    const triggerChange = (newData: CustomOptionsData) => {
        setData(newData)
        onChange(JSON.stringify(newData))
    }

    return (
        <div className="space-y-6 border p-6 rounded-lg bg-neutral-50/50">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kişiselleştirme Ayarları</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Sabit Kişiselleştirme Ücreti (₺)</Label>
                        <Input
                            type="number"
                            disabled={disabled}
                            value={data.basePriceAddition}
                            onChange={e => triggerChange({ ...data, basePriceAddition: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Özel Metin Karakter Limiti</Label>
                        <Input
                            type="number"
                            min={0}
                            disabled={disabled}
                            value={data.maxTextLength}
                            onChange={e => triggerChange({ ...data, maxTextLength: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">0 bırakırsanız müşteriden metin alınmaz.</p>
                    </div>
                    <label className="col-span-2 flex items-center gap-3 rounded-md border bg-white p-3 text-sm">
                        <Checkbox
                            checked={data.allowFileUpload}
                            disabled={disabled}
                            onCheckedChange={(checked) => triggerChange({ ...data, allowFileUpload: checked === true })}
                        />
                        <span>Müşteri dosya yükleyebilsin (logo, görsel, SVG, STL vb.)</span>
                    </label>
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Renk Seçenekleri</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => triggerChange({ ...data, colors: [...data.colors, { label: 'Yeni Renk', hex: '#000000', price: 0 }] })} disabled={disabled}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Ekle
                    </Button>
                </div>
                <div className="space-y-3">
                    {data.colors.map((color, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <Input className="w-8 h-10 p-1" type="color" value={color.hex} disabled={disabled} onChange={e => {
                                const newColors = [...data.colors]; newColors[idx].hex = e.target.value; triggerChange({ ...data, colors: newColors })
                            }} />
                            <Input placeholder="Renk adı" value={color.label} disabled={disabled} onChange={e => {
                                const newColors = [...data.colors]; newColors[idx].label = e.target.value; triggerChange({ ...data, colors: newColors })
                            }} />
                            <Input type="number" placeholder="Ek Ücret" className="w-32" value={color.price} disabled={disabled} onChange={e => {
                                const newColors = [...data.colors]; newColors[idx].price = Number(e.target.value); triggerChange({ ...data, colors: newColors })
                            }} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => {
                                const newColors = data.colors.filter((_, i) => i !== idx); triggerChange({ ...data, colors: newColors })
                            }} disabled={disabled}>
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Beden / Boyut Seçenekleri</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => triggerChange({ ...data, sizes: [...data.sizes, { label: 'Yeni Beden', price: 0 }] })} disabled={disabled}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Ekle
                    </Button>
                </div>
                <div className="space-y-3">
                    {data.sizes.map((size, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <Input placeholder="Beden/Ebat (Örn: XL, 50x70cm)" value={size.label} disabled={disabled} onChange={e => {
                                const newSizes = [...data.sizes]; newSizes[idx].label = e.target.value; triggerChange({ ...data, sizes: newSizes })
                            }} />
                            <Input type="number" placeholder="Ek Ücret" className="w-32" value={size.price} disabled={disabled} onChange={e => {
                                const newSizes = [...data.sizes]; newSizes[idx].price = Number(e.target.value); triggerChange({ ...data, sizes: newSizes })
                            }} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => {
                                const newSizes = data.sizes.filter((_, i) => i !== idx); triggerChange({ ...data, sizes: newSizes })
                            }} disabled={disabled}>
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
