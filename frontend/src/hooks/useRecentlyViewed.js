import { useState, useCallback } from 'react'

const STORAGE_KEY = 'momato_recently_viewed'
const MAX_ITEMS = 10

const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useRecentlyViewed = () => {
  const [items, setItems] = useState(readFromStorage)

  const addRestaurant = useCallback((restaurant) => {
    if (!restaurant?.id) return
    const entry = {
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      area: restaurant.area || restaurant.address,
      costForTwo: restaurant.costForTwo,
      deliveryTime: restaurant.deliveryTime,
      viewedAt: Date.now(),
    }
    const prev = readFromStorage().filter(r => r.id !== restaurant.id)
    const updated = [entry, ...prev].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setItems(updated)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setItems([])
  }, [])

  return { recentlyViewed: items, addRestaurant, clear }
}
