<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="flex flex-col items-center">
      <h1 class="font-semibold text-6xl">404</h1>
      <p>Page Not Found</p>
      <router-link class="text-link-primary mt-3" :to="{name: $routeNames.chat}">Go back to home</router-link>
    </div>
  </div>
</template>
