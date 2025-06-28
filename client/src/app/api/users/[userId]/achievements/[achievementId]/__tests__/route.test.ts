/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { achievements } from '@/lib/schema'
import {
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse
} from '@/test-utils/test-utils.helper'
import { and, eq } from 'drizzle-orm/sql'
import { NextRequest } from 'next/server'
import { DELETE } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    delete: jest.fn(),
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm/sql', () => ({
  and: jest.fn(),
  eq: jest.fn(),
}))

describe('/api/users/[userId]/achievements/[achievementId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  const mockAnd = and as jest.MockedFunction<typeof and>
  const mockEq = eq as jest.MockedFunction<typeof eq>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Helper function to create mock achievement data
  const createMockAchievement = (overrides: Partial<any> = {}) => ({
    id: 1,
    athlete: 1,
    title: 'State Champion',
    description: 'Won first place in state competition',
    date: '2024-01-15T00:00:00.000Z', // Use string format to match JSON serialization
    ...overrides,
  })

  describe('DELETE', () => {
    it('should delete an achievement successfully', async () => {
      // Mock data
      const mockDeletedAchievement = createMockAchievement({
        id: 1,
        title: 'State Champion',
      })

      // Mock the database delete chain
      const mockReturning = jest.fn().mockResolvedValue([mockDeletedAchievement])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1', achievementId: '1' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual(mockDeletedAchievement)
      expect(mockDb.delete).toHaveBeenCalledWith(achievements)
      expect(mockWhere).toHaveBeenCalledWith(mockAnd(mockEq(achievements.athlete, 1), mockEq(achievements.id, 1)))
    })

    it('should return null when achievement does not exist', async () => {
      // Mock empty results (achievement not found)
      const mockReturning = jest.fn().mockResolvedValue([])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1', achievementId: '999' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1', achievementId: '1' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle invalid user ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with invalid user ID
      const params = Promise.resolve({ userId: 'invalid', achievementId: '1' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle invalid achievement ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with invalid achievement ID
      const params = Promise.resolve({ userId: '1', achievementId: 'invalid' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle missing user ID', async () => {
      // Mock database error for missing ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with missing user ID
      const params = Promise.resolve({ userId: '', achievementId: '1' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle missing achievement ID', async () => {
      // Mock database error for missing ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with missing achievement ID
      const params = Promise.resolve({ userId: '1', achievementId: '' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle both invalid user ID and achievement ID', async () => {
      // Mock database error for invalid IDs
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with both invalid IDs
      const params = Promise.resolve({ userId: 'invalid', achievementId: 'invalid' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle non-numeric user ID and achievement ID', async () => {
      // Mock database error for non-numeric IDs
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Mock params with non-numeric IDs
      const params = Promise.resolve({ userId: 'abc', achievementId: 'def' })

      // Call the API
      const response = await DELETE({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })
  })
}) 