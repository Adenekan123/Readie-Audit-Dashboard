import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim()
  || '/api'
const myAuthorizationx = import.meta.env.VITE_API_MY_AUTHORIZATIONX?.trim()
const authorizationValue = import.meta.env.VITE_API_AUTHORIZATION?.trim() ?? ''
const basicCredential = authorizationValue.replace(/^Basic\s+/i, '').replace(/\s/g, '')

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  config.headers.set('Content-Type', 'application/json')
  if (myAuthorizationx) config.headers.set('MyAuthorizationx', myAuthorizationx)
  if (basicCredential) config.headers.set('Authorization', `Basic ${basicCredential}`)

  return config
})
