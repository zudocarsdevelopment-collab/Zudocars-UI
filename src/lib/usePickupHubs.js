import { useEffect, useState } from 'react'
import { apiUrl } from './apiConfig'

export default function usePickupHubs() {
  const [hubs, setHubs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    fetch(apiUrl('/api/pickup-hubs/')).then(async (response) => {
      if (!response.ok) throw new Error('Unable to load pickup locations.')
      return response.json()
    }).then((data) => { if (active) setHubs(data) }).catch((error) => { if (active) setError(error.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return { hubs, error, loading }
}
