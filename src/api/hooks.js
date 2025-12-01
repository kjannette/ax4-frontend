/**
 * React Query Hooks for Bridge Finder API
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from './api';

/**
 * Fetch all supported chains across all protocols
 * @returns {UseQueryResult} Query result with chains data
 */
export function useChains() {
  return useQuery({
    queryKey: ['chains'],
    queryFn: () => get('/api/chains'),
    select: (data) => data.chains,
  });
}

/**
 * Fetch supported tokens for a specific chain
 * @param {string} chain - Chain identifier (e.g., 'ethereum', 'polygon')
 * @param {Object} options - Additional query options
 * @returns {UseQueryResult} Query result with tokens data
 */
export function useTokens(chain, options = {}) {
  return useQuery({
    queryKey: ['tokens', chain],
    queryFn: () => get(`/api/tokens/${chain}`),
    select: (data) => data.tokens,
    enabled: !!chain, // Only fetch when chain is provided
    ...options,
  });
}

/**
 * Fetch best routes for a bridge request
 * Use this for one-time fetches with known parameters
 * @param {Object} params - Route parameters
 * @param {string} params.fromChain - Source chain
 * @param {string} params.toChain - Destination chain
 * @param {string} params.token - Token address
 * @param {string} params.amount - Amount to bridge
 * @param {string} [params.fromAddress] - Sender address
 * @param {string} [params.toAddress] - Recipient address
 * @param {Object} options - Additional query options
 * @returns {UseQueryResult} Query result with routes data
 */
export function useRoutes(params, options = {}) {
  const { fromChain, toChain, token, amount } = params || {};
  const isEnabled = !!(fromChain && toChain && token && amount);

  return useQuery({
    queryKey: ['routes', params],
    queryFn: () => post('/api/routes', params),
    select: (data) => data.routes,
    enabled: isEnabled,
    staleTime: 1000 * 30, // Routes go stale after 30 seconds (prices change)
    ...options,
  });
}

/**
 * Mutation hook for finding routes
 * Use this when you want to trigger route finding on demand (e.g., button click)
 * @returns {UseMutationResult} Mutation result
 */
export function useFindRoutes() {
  return useMutation({
    mutationFn: (params) => post('/api/routes', params),
    // You can add onSuccess, onError callbacks when using this hook
  });
}

/**
 * Mutation hook for finding the single best route
 * @returns {UseMutationResult} Mutation result
 */
export function useFindBestRoute() {
  return useMutation({
    mutationFn: (params) => post('/api/routes/best', params),
  });
}

/**
 * Health check query
 * Useful for checking if backend is available
 * @returns {UseQueryResult} Query result with health status
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => get('/api/health'),
    staleTime: 1000 * 10, // Check every 10 seconds at most
    retry: 1,
  });
}

