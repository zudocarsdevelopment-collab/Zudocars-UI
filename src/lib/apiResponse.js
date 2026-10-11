export async function readApiJson(response, action) {
  const body = await response.text()
  let data
  try {
    data = JSON.parse(body)
  } catch {
    if (response.status === 404) {
      throw new Error(`${action} The API endpoint is unavailable. Deploy the latest backend and run its database migrations.`)
    }
    throw new Error(`${action} The API returned an unexpected response (HTTP ${response.status}). Please check the backend server.`)
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.detail || Object.values(data || {}).flat().join(' ') || action)
  }
  return data
}
