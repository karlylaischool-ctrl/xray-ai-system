const configuredApiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

export const API_URL = /^https?:\/\//i.test(configuredApiUrl) && !/\/api$/i.test(configuredApiUrl)
  ? `${configuredApiUrl}/api`
  : configuredApiUrl
