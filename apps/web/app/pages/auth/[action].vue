<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const intent = resolveIdentityAuthIntent(String(route.params.action))
if (!intent) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
}

onMounted(() => {
  const redirect = resolveIdentityRedirect(route.query.redirect, '/dashboard')
  const params = new URLSearchParams({ intent, returnTo: redirect })
  if (typeof route.query.email === 'string') params.set('email', route.query.email)
  if (typeof route.query.token === 'string') params.set('token', route.query.token)

  void navigateTo(`/api/identity/starter/auth/authorize?${params.toString()}`, {
    external: true,
    replace: true
  })
})
</script>

<template>
  <main />
</template>
