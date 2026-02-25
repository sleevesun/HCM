import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const role = ref('finance') // Default to finance for demo

  const setRole = (newRole: string) => {
    role.value = newRole
  }

  const hasPermission = (permissionRole: string) => {
    return role.value === permissionRole
  }

  return {
    role,
    setRole,
    hasPermission
  }
})
