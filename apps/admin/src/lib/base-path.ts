export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/admin07'

export function adminPath(path: string) {
   return `${basePath}${path.startsWith('/') ? path : `/${path}`}`
}
