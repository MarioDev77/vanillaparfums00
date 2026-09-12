// Função pura, sem dependência de navegador — por isso fica fora de qualquer arquivo 'use client'.
// Isso permite importá-la tanto em Server Components (ex.: app/contratipos/page.tsx) quanto em
// Client Components, sem esbarrar na restrição do Next.js de cruzar o boundary client/server
// com funções vindas de um módulo 'use client'.
export const whatsappLink = (productName?: string) =>
  `/api/whatsapp?text=${encodeURIComponent(productName ? `Olá! Tenho interesse no contratipo ${productName}.` : 'Olá! Gostaria de conhecer os contratipos disponíveis.')}`
