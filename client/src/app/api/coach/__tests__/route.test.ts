/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { coaches, users } from '@/lib/schema'
import {
    createMockCoach,
    mockDbQueryChain,
    mockDbQueryChainWithError,
    validateApiResponse,
    validateCoachDataStructure,
    validateErrorResponse,
    validateSuccessResponse
} from '@/test-utils/test-utils.helper'
import { GET } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}))

describe('/api/coach', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all coaches with user information successfully', async () => {
      // Mock data
      const mockCoaches = [
        createMockCoach({ id: 1, user: 1, name: 'John Doe' }),
        createMockCoach({ id: 2, user: 2, name: 'Jane Smith', title: 'Assistant Coach', isSeniorStaff: false }),
      ]

      // Mock the database query chain
      mockDb.select.mockReturnValue(mockDbQueryChain(mockCoaches)())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockCoaches)
      expect(mockDb.select).toHaveBeenCalledWith({
        id: coaches.id,
        user: coaches.user,
        name: users.name,
        title: coaches.title,
        description: coaches.description,
        isSeniorStaff: coaches.isSeniorStaff,
      })
    })

    it('should return empty array when no coaches exist', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue(mockDbQueryChain([])())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValue(mockDbQueryChainWithError(mockError)())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle unknown errors gracefully', async () => {
      // Mock unknown error
      mockDb.select.mockReturnValue(mockDbQueryChainWithError('Unknown error')())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Unknown error')
    })

    it('should handle null/undefined errors gracefully', async () => {
      // Mock null error
      mockDb.select.mockReturnValue(mockDbQueryChainWithError(null)())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'null')
    })

    it('should include correct coach data structure', async () => {
      // Mock data with all fields
      const mockCoach = createMockCoach()

      mockDb.select.mockReturnValue(mockDbQueryChain([mockCoach])())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      validateCoachDataStructure(data.body[0])
    })

    it('should handle coaches with null/undefined optional fields', async () => {
      // Mock data with null fields
      const mockCoaches = [
        createMockCoach({ title: null, description: null, isSeniorStaff: false }),
      ]

      mockDb.select.mockReturnValue(mockDbQueryChain(mockCoaches)())

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body[0].title).toBeNull()
      expect(data.body[0].description).toBeNull()
    })
  })
}) 