import { NextRequest, NextResponse } from 'next/server'

// Número fica só em variável de ambiente do servidor (sem prefixo NEXT_PUBLIC_),
// então nunca é incluído no JavaScript enviado ao navegador.
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text') || 'Olá! Gostaria de conhecer os contratipos disponíveis.'

  if (!WHATSAPP_NUMBER) {
    // Sem número configurado, cai no comportamento antigo (deixa a pessoa escolher o contato no WhatsApp)
    return NextResponse.redirect(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return NextResponse.redirect(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`)
}
