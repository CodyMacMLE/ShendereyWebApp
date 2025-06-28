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
import { eq } from 'drizzle-orm/sql'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm/sql', () => ({
  eq: jest.fn(),
}))

describe('/api/users/[userId]/achievements', () => {
  const mockDb = db as jest.Mocked<typeof db>
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

  describe('GET', () => {
    it('should return achievements for a valid user ID successfully', async () => {
      // Mock data
      const mockAchievements = [
        createMockAchievement({ id: 1, title: 'State Champion' }),
        createMockAchievement({ id: 2, title: 'Regional Winner' }),
      ]

      // Mock the database query chain
      const mockWhere = jest.fn().mockResolvedValue(mockAchievements)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual(mockAchievements)
      expect(mockDb.select).toHaveBeenCalledWith()
      expect(mockFrom).toHaveBeenCalledWith(achievements)
      expect(mockWhere).toHaveBeenCalledWith(mockEq(achievements.athlete, 1))
    })

    it('should return empty array when user has no achievements', async () => {
      // Mock empty results
      const mockWhere = jest.fn().mockResolvedValue([])
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      const mockWhere = jest.fn().mockRejectedValue(mockError)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle invalid user ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockWhere = jest.fn().mockRejectedValue(mockError)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Mock params with invalid user ID
      const params = Promise.resolve({ userId: 'invalid' })

      // Call the API
      const response = await GET({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle missing user ID', async () => {
      // Mock database error for missing ID
      const mockError = new Error('Database connection failed')
      const mockWhere = jest.fn().mockRejectedValue(mockError)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Mock params with missing user ID
      const params = Promise.resolve({ userId: '' })

      // Call the API
      const response = await GET({} as NextRequest, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })
  })

  describe('POST', () => {
    it('should create a new achievement successfully', async () => {
      // Mock data
      const achievementData = {
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: '2024-06-15',
      }

      const mockInsertedAchievement = createMockAchievement({
        id: 3,
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: '2024-06-15T00:00:00.000Z',
      })

      // Mock the database insert chain
      const mockReturning = jest.fn().mockResolvedValue([mockInsertedAchievement])
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.insert.mockReturnValue({ values: mockValues } as any)

      // Mock request
      const req = {
        json: jest.fn().mockResolvedValue(achievementData),
      } as any

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual(mockInsertedAchievement)
      expect(mockDb.insert).toHaveBeenCalledWith(achievements)
      expect(mockValues).toHaveBeenCalledWith({
        athlete: 1,
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: new Date('2024-06-15'),
      })
    })

    it('should handle missing required fields', async () => {
      // Mock data with missing fields
      const achievementData = {
        title: 'National Champion',
        // Missing description and date
      }

      // Mock database error for missing fields
      const mockError = new Error('Insert failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.insert.mockReturnValue({ values: mockValues } as any)

      // Mock request
      const req = {
        json: jest.fn().mockResolvedValue(achievementData),
      } as any

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Insert failed')
    })

    it('should handle invalid date format', async () => {
      // Mock data with invalid date
      const achievementData = {
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: 'invalid-date',
      }

      // Mock database error for invalid date
      const mockError = new Error('Invalid date format')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.insert.mockReturnValue({ values: mockValues } as any)

      // Mock request
      const req = {
        json: jest.fn().mockResolvedValue(achievementData),
      } as any

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Invalid date format')
    })

    it('should handle database insertion errors', async () => {
      // Mock data
      const achievementData = {
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: '2024-06-15',
      }

      // Mock database error
      const mockError = new Error('Insert failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.insert.mockReturnValue({ values: mockValues } as any)

      // Mock request
      const req = {
        json: jest.fn().mockResolvedValue(achievementData),
      } as any

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Insert failed')
    })

    it('should handle invalid user ID in POST', async () => {
      // Mock data
      const achievementData = {
        title: 'National Champion',
        description: 'Won first place in national competition',
        date: '2024-06-15',
      }

      // Mock database error for invalid user ID
      const mockError = new Error('Insert failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.insert.mockReturnValue({ values: mockValues } as any)

      // Mock request
      const req = {
        json: jest.fn().mockResolvedValue(achievementData),
      } as any

      // Mock params with invalid user ID
      const params = Promise.resolve({ userId: 'invalid' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Insert failed')
    })

    it('should handle request body parsing errors', async () => {
      // Mock request with parsing error
      const req = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      // Mock params
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Invalid JSON')
    })
  })
}) 