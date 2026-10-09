import { useEffect, useState } from 'react'
import { apiUrl } from './apiConfig'

export default function usePickupHubs() {
  const [hubs, setHubs] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetch(apiUrl('/api/pickup-hubs/')).then(async (response) => {
      if (!response.ok) throw new Error('Unable to load pickup locations.')
      return response.json()
    }).then((data) => { if (active) setHubs(data) }).catch((error) => { if (active) setError(error.message) })
    return () => { active = false }
  }, [])
  return { hubs, error }
}
