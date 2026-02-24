'use client'

import { Heading } from '@/components/native/heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/native/separator'
import { useCartContext } from '@/state/Cart'
import { CheckCircle2Icon } from 'lucide-react'

export default function CheckoutPage() {
   const { cart } = useCartContext()

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700 pb-24">
         <Heading
            title="Checkout"
            description="Complete your order."
         />
         <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle className=" flex items-center gap-2">
                        <CheckCircle2Icon className="text-primary h-5 w-5" />
                        Shipping Information
                     </CardTitle>
                     <CardDescription>Where should we send your order?</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {/* Shipping Form Placeholder */}
                     <p className="text-muted-foreground text-sm">Shipping form will be here.</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader>
                     <CardTitle className=" flex items-center gap-2">
                        <CheckCircle2Icon className="text-primary h-5 w-5" />
                        Payment Method
                     </CardTitle>
                     <CardDescription>How would you like to pay?</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {/* Payment Options Placeholder */}
                     <p className="text-muted-foreground text-sm">Payment methods will be here.</p>
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-1">
               <Card>
                  <CardHeader className="pb-4">
                     <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                     <div className="space-y-4">
                        {cart?.items?.map((item, i) => (
                           <div key={i} className="flex justify-between items-center gap-4">
                              <span className="truncate">{item.count}x {item.product.title}</span>
                              <span className="font-semibold whitespace-nowrap">${(item.product.price * item.count).toFixed(2)}</span>
                           </div>
                        ))}
                     </div>
                     <Separator className="my-6" />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total (est.)</span>
                        <span>$ --.--</span>
                     </div>
                  </CardContent>
                  <CardFooter>
                     <Button className="w-full" size="lg">Complete Order</Button>
                  </CardFooter>
               </Card>
            </div>
         </div>
      </div>
   )
}
