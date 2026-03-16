export function isFlashSaleActive(product: any): boolean {
   return !!(
      product?.flashSalePrice != null &&
      product?.flashSalePrice > 0 &&
      product?.flashSaleEndDate &&
      new Date(product.flashSaleEndDate).getTime() > Date.now()
   )
}

export function getEffectivePrice(product: any): number {
   if (isFlashSaleActive(product)) {
      return product.flashSalePrice
   }
   return (product?.price ?? 0) - (product?.discount ?? 0)
}

export function getEffectivePriceBreakdown(product: any): {
   price: number
   discount: number
   isFlashSale: boolean
} {
   if (isFlashSaleActive(product)) {
      return { price: product.flashSalePrice, discount: 0, isFlashSale: true }
   }
   return {
      price: product?.price ?? 0,
      discount: product?.discount ?? 0,
      isFlashSale: false,
   }
}
