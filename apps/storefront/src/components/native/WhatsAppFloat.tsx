'use client'

import { useState, useEffect } from 'react'

export default function WhatsAppFloat() {
   const [mounted, setMounted] = useState(false)
   const [hovered, setHovered] = useState(false)

   useEffect(() => {
      const timer = setTimeout(() => setMounted(true), 300)
      return () => clearTimeout(timer)
   }, [])

   return (
      <>
         <style>{`
            @keyframes whatsapp-entry {
               0% {
                  opacity: 0;
                  transform: translateY(80px) scale(0.5);
               }
               60% {
                  opacity: 1;
                  transform: translateY(-8px) scale(1.05);
               }
               80% {
                  transform: translateY(3px) scale(0.98);
               }
               100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
               }
            }

            @keyframes whatsapp-pulse {
               0%, 100% {
                  box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
               }
               50% {
                  box-shadow: 0 0 0 12px rgba(37, 211, 102, 0);
               }
            }

            @keyframes whatsapp-dot-pulse {
               0%, 100% {
                  transform: scale(1);
                  opacity: 1;
               }
               50% {
                  transform: scale(1.3);
                  opacity: 0.7;
               }
            }

            @keyframes whatsapp-tooltip-in {
               0% {
                  opacity: 0;
                  transform: translateX(10px);
               }
               100% {
                  opacity: 1;
                  transform: translateX(0);
               }
            }

            .whatsapp-float-btn {
               animation: whatsapp-entry 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                          whatsapp-pulse 3s ease-in-out 1.5s infinite;
            }

            .whatsapp-float-btn:hover {
               animation: none;
               box-shadow: 0 0 20px 4px rgba(37, 211, 102, 0.4);
            }

            .whatsapp-tooltip {
               animation: whatsapp-tooltip-in 0.25s ease-out forwards;
            }

            .whatsapp-dot {
               animation: whatsapp-dot-pulse 1.5s ease-in-out infinite;
            }
         `}</style>

         <div
            className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-3 transition-opacity duration-500 ${
               mounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
         >
            {/* Tooltip */}
            {hovered && (
               <div className="whatsapp-tooltip bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  Bize yazin!
               </div>
            )}

            {/* Button */}
            <a
               href="https://wa.me/905382880738"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="WhatsApp ile iletisime gecin"
               onMouseEnter={() => setHovered(true)}
               onMouseLeave={() => setHovered(false)}
               className={`whatsapp-float-btn relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-transform duration-200 ${
                  hovered ? 'scale-110' : ''
               }`}
               style={{ backgroundColor: '#25D366' }}
            >
               {/* Notification dot */}
               <span className="whatsapp-dot absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />

               {/* WhatsApp SVG Icon */}
               <svg
                  className="w-6 h-6 md:w-7 md:h-7"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
               </svg>
            </a>
         </div>
      </>
   )
}
