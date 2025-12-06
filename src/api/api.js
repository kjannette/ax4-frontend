/**
 * HTTP Client for Backend API
 * Uses native fetch - designed to work with React Query
 */

// In production, use relative URLs (nginx proxies /api to backend)
// In development, use localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle response and parse JSON
 * Throws ApiError for non-2xx responses
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

/**
 * HTTP GET request
 * @param {string} endpoint - API endpoint (e.g., '/api/chains')
 * @param {Object} params - Optional query parameters
 * @returns {Promise<any>} Response data
 */
export async function get(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Append query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse(response);
}

/**
 * HTTP POST request
 * @param {string} endpoint - API endpoint (e.g., '/api/routes')
 * @param {Object} body - Request body
 * @returns {Promise<any>} Response data
 */
export async function post(endpoint, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

/**
 * HTTP PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<any>} Response data
 */
export async function put(endpoint, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

/**
 * HTTP DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Response data
 */
export async function del(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse(response);
}

export { ApiError };

