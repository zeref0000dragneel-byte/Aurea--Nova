import { Badge } from '@/components/ui/badge'
import { BotonTestTelegram } from './boton-test-telegram'

export default function AdminConfiguracionTelegramPage() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID ?? ''
  const lastFour = chatId.length >= 4 ? chatId.slice(-4) : ''
  const displayChatId = chatId ? `****${lastFour}` : '—'

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wide text-neutral-700">
          Configuración Telegram
        </h1>
        <p className="text-sm font-medium text-neutral-700/80 mt-1">
          Estado del bot y envío de mensajes de prueba
        </p>
      </div>

      <div className="space-y-6 max-w-md rounded-3xl border border-accent-miel/30 bg-gradient-to-br from-neutral-50 to-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Bot:</span>
          {token ? (
            <Badge className="bg-success/10 text-success border-0">
              Bot configurado
            </Badge>
          ) : (
            <Badge variant="destructive">No configurado</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Chat ID:</span>
          <span className="text-sm text-neutral-700 font-mono">{displayChatId}</span>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Mensaje de prueba
          </p>
          <BotonTestTelegram />
        </div>
      </div>
    </div>
  )
}
