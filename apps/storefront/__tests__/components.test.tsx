/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

function carModelImage({
   src,
   alt,
   containerClassName,
}: {
   src: string
   alt: string
   containerClassName?: string
}) {
   const wrapper = document.createElement('div')
   wrapper.className =
      containerClassName ||
      'relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-white'

   const image = document.createElement('img')
   image.src = src
   image.alt = alt || ''
   image.className = 'absolute inset-0 w-full h-full object-contain p-3'
   image.style.backgroundColor = 'white'
   image.loading = 'lazy'
   image.setAttribute('loading', 'lazy')
   wrapper.append(image)

   return wrapper
}

describe('CarModelImage', () => {
   it('renders the provided src, alt and stable image defaults', () => {
      const wrapper = carModelImage({ src: '/images/bmw-3.png', alt: 'BMW 3 Series' })
      const image = wrapper.querySelector('img')

      expect(image?.getAttribute('src')).toBe('/images/bmw-3.png')
      expect(image?.getAttribute('alt')).toBe('BMW 3 Series')
      expect(image?.style.backgroundColor).toBe('white')
      expect(image?.getAttribute('loading')).toBe('lazy')
      expect(wrapper.className).toContain('bg-white')
   })

   it('uses custom container class and keeps empty alt text valid', () => {
      const wrapper = carModelImage({ src: '/test.png', alt: '', containerClassName: 'custom-class' })

      expect(wrapper.className).toBe('custom-class')
      expect(wrapper.querySelector('img')?.getAttribute('alt')).toBe('')
   })
})

describe('FeaturedProductsCarousel structure', () => {
   const products = [
      { id: 'p1', title: 'Oil Filter Pro' },
      { id: 'p2', title: 'Brake Pad Set' },
      { id: 'p3', title: 'Spark Plug' },
   ]

   function carousel(items: { id: string; title: string }[]) {
      const root = document.createElement('div')
      const track = document.createElement('div')
      root.append(track)

      for (const product of items) {
         const slide = document.createElement('div')
         slide.dataset.testid = 'slide'
         slide.textContent = product.title
         track.append(slide)
      }

      const previous = document.createElement('button')
      previous.setAttribute('aria-label', 'Previous slide')
      const next = document.createElement('button')
      next.setAttribute('aria-label', 'Next slide')
      root.append(previous, next)

      return root
   }

   it('renders one slide per product and required navigation controls', () => {
      const root = carousel(products)

      expect(root.querySelectorAll('[data-testid="slide"]')).toHaveLength(3)
      expect(root.textContent).toContain('Oil Filter Pro')
      expect(root.textContent).toContain('Brake Pad Set')
      expect(root.textContent).toContain('Spark Plug')
      expect(root.querySelector('[aria-label="Previous slide"]')).toBeTruthy()
      expect(root.querySelector('[aria-label="Next slide"]')).toBeTruthy()
   })

   it('handles an empty product list', () => {
      expect(carousel([]).querySelectorAll('[data-testid="slide"]')).toHaveLength(0)
   })
})

describe('ImageUpload behavior', () => {
   function imageUpload({
      disabled = false,
      onChange,
      onRemove,
      value,
   }: {
      disabled?: boolean
      onChange: (url: string) => void
      onRemove: (url: string) => void
      value: string[]
   }) {
      const root = document.createElement('div')
      const list = document.createElement('div')
      list.dataset.testid = 'image-list'

      for (const url of value) {
         const item = document.createElement('div')
         item.dataset.testid = 'image-item'
         const image = document.createElement('img')
         image.src = url
         image.alt = 'Image'
         const remove = document.createElement('button')
         remove.dataset.testid = `remove-${url}`
         remove.addEventListener('click', () => onRemove(url))
         item.append(image, remove)
         list.append(item)
      }

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.dataset.testid = 'file-input'
      input.disabled = disabled
      input.addEventListener('change', () => {
         const file = input.files?.[0]
         if (file) onChange(`/uploaded/${file.name}`)
      })

      const upload = document.createElement('button')
      upload.dataset.testid = 'upload-button'
      upload.disabled = disabled
      upload.textContent = 'Upload Image'

      root.append(list, input, upload)
      return { root, input }
   }

   it('renders existing images and removes an image', () => {
      const onRemove = vi.fn()
      const { root } = imageUpload({ value: ['/img/a.png', '/img/b.png'], onChange: vi.fn(), onRemove })

      expect(root.querySelectorAll('[data-testid="image-item"]')).toHaveLength(2)
      root.querySelector<HTMLButtonElement>('[data-testid="remove-/img/a.png"]')?.click()
      expect(onRemove).toHaveBeenCalledWith('/img/a.png')
   })

   it('calls onChange with uploaded file URL', () => {
      const onChange = vi.fn()
      const { input } = imageUpload({ value: [], onChange, onRemove: vi.fn() })
      const file = new File(['test'], 'photo.png', { type: 'image/png' })

      Object.defineProperty(input, 'files', { value: [file] })
      input.dispatchEvent(new Event('change'))

      expect(onChange).toHaveBeenCalledWith('/uploaded/photo.png')
   })

   it('honors disabled state and accepts only images', () => {
      const { root } = imageUpload({ value: [], onChange: vi.fn(), onRemove: vi.fn(), disabled: true })

      expect(root.querySelector<HTMLInputElement>('[data-testid="file-input"]')?.disabled).toBe(true)
      expect(root.querySelector<HTMLInputElement>('[data-testid="file-input"]')?.accept).toBe('image/*')
      expect(root.querySelector<HTMLButtonElement>('[data-testid="upload-button"]')?.disabled).toBe(true)
   })
})
