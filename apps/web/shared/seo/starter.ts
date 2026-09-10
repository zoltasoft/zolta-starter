export function shouldNoIndexStarterPath(pathname: string) {
  return pathname.includes('/saas/dashboard') || pathname.includes('/auth/')
}
