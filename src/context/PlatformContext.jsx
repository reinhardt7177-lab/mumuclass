import { createContext, useContext, useState, useEffect } from 'react'

const ADMIN_ID = 'admin@mumuclass.kr'
const ADMIN_PW = 'Mumu@2025!'
const STORAGE_KEY = 'mumu_platform_items'

const PlatformContext = createContext(null)

export function PlatformProvider({ children }) {
  const [userItems, setUserItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userItems))
    } catch {
      // localStorage full — silent fail
    }
  }, [userItems])

  function adminLogin(id, pw) {
    if (id.trim() === ADMIN_ID && pw === ADMIN_PW) {
      setIsAdmin(true)
      return true
    }
    return false
  }

  function adminLogout() {
    setIsAdmin(false)
  }

  function addItem(item) {
    const newItem = {
      ...item,
      id: `user_${Date.now()}`,
      isUserSubmitted: true,
      downloads: 0,
      views: 0,
      status: 'Live',
      statusColor: '#5DCAA5',
      createdAt: new Date().toISOString(),
    }
    setUserItems((prev) => [newItem, ...prev])
    return newItem
  }

  function deleteItem(id) {
    setUserItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateItem(id, changes) {
    setUserItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    )
  }

  return (
    <PlatformContext.Provider
      value={{ userItems, isAdmin, adminLogin, adminLogout, addItem, deleteItem, updateItem }}
    >
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  return useContext(PlatformContext)
}
