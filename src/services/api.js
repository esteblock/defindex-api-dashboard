const API_BASE_URL = 'https://api.defindex.io'
const API_KEY = import.meta.env.VITE_DEFINDEX_API_KEY

/**
 * Helper for GET requests
 * @param {string} endpoint - API endpoint (e.g., 'apy', 'history', 'report')
 * @param {string} vaultAddress - The vault contract address
 * @param {Record<string, any>} params - Query parameters
 * @returns {Promise<any>} API response
 */
async function getData(endpoint, vaultAddress, params = {}) {
  if (!API_KEY) {
    throw new Error('VITE_DEFINDEX_API_KEY is not set. Please configure your API key in the environment variables.')
  }

  const url = Object.keys(params).length > 0
    ? `${API_BASE_URL}/vault/${vaultAddress}/${endpoint}?${new URLSearchParams(params).toString()}`
    : `${API_BASE_URL}/vault/${vaultAddress}/${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to API. Please check your internet connection and CORS settings.`)
    }
    throw error
  }
}

/**
 * Helper for POST requests
 * @param {string} endpoint - API endpoint
 * @param {string} vaultAddress - The vault contract address
 * @param {Record<string, any>} params - Request body parameters
 * @returns {Promise<any>} API response
 */
async function postData(endpoint, vaultAddress, params = {}) {
  if (!API_KEY) {
    throw new Error('VITE_DEFINDEX_API_KEY is not set. Please configure your API key in the environment variables.')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/vault/${vaultAddress}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to API. Please check your internet connection and CORS settings.`)
    }
    throw error
  }
}

/**
 * Fetch vault information
 * @param {string} vaultAddress - The vault contract address
 * @param {string} network - Network to query (testnet or mainnet)
 * @returns {Promise<Object>} Vault information
 */
export async function getVaultInfo(vaultAddress, network = 'mainnet') {
  if (!API_KEY) {
    throw new Error('VITE_DEFINDEX_API_KEY is not set. Please configure your API key in the environment variables.')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/vault/${vaultAddress}?network=${network}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to fetch vault info: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to API. Please check your internet connection and CORS settings.`)
    }
    throw error
  }
}

/**
 * Fetch vault APY (Annual Percentage Yield)
 * @param {string} vaultAddress - The vault contract address
 * @param {string} network - Network to query (testnet or mainnet)
 * @returns {Promise<Object>} Vault APY data
 */
export async function getVaultAPY(vaultAddress, network = 'mainnet') {
  return getData('apy', vaultAddress, { network })
}

/**
 * Fetch vault historical performance data
 * @param {string} vaultAddress - The vault contract address
 * @param {string} network - Network to query (testnet or mainnet)
 * @param {string} period - Time period: all, 7d, 30d, 90d, 1y (default: 'all')
 * @param {string} interval - Data aggregation: hourly, daily, weekly, monthly (default: 'daily')
 * @param {string} startDate - Start date in ISO 8601 format (optional)
 * @param {string} endDate - End date in ISO 8601 format (optional)
 * @returns {Promise<Object>} Historical performance data
 */
export async function getVaultHistory(vaultAddress, network = 'mainnet', period = 'all', interval = 'daily', startDate = null, endDate = null) {
  const params = { network, period, interval }
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  return getData('history', vaultAddress, params)
}

/**
 * Fetch vault performance report
 * @param {string} vaultAddress - The vault contract address
 * @param {string} network - Network to query (testnet or mainnet)
 * @returns {Promise<Object>} Vault performance report
 */
export async function getVaultReport(vaultAddress, network = 'mainnet') {
  return getData('report', vaultAddress, { network })
}

/**
 * Fetch user balance in a specific vault
 * @param {string} vaultAddress - The vault contract address
 * @param {string} userAddress - The user wallet address
 * @param {string} network - Network to query (testnet or mainnet)
 * @returns {Promise<Object>} User balance data
 */
export async function getVaultBalance(vaultAddress, userAddress, network = 'mainnet') {
  return getData('balance', vaultAddress, { from: userAddress, network })
}

/**
 * Get factory contract address for a specific network
 * @param {string} network - Network identifier (e.g., 'testnet', 'mainnet')
 * @returns {Promise<Object>} Factory address data
 */
export async function getFactoryAddress(network = 'mainnet') {
  if (!API_KEY) {
    throw new Error('VITE_DEFINDEX_API_KEY is not set. Please configure your API key in the environment variables.')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/factory/address?network=${network}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to fetch factory address: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to API. Please check your internet connection and CORS settings.`)
    }
    throw error
  }
}
