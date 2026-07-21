import { createClient } from '@neondatabase/neon-js'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL?.trim()

export const cloudConfigured = Boolean(authUrl && dataApiUrl)

export const cloudClient = cloudConfigured
  ? createClient({
      auth: {
        adapter: BetterAuthReactAdapter(),
        url: authUrl,
      },
      dataApi: {
        url: dataApiUrl,
      },
    })
  : null
