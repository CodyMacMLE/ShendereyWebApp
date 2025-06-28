/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { achievements } from '@/lib/schema'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the database module for integration tests
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

describe('/api/users/[userId]/achievements - Integration Tests', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
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

  describe('GET /api/users/[userId]/achievements', () => {
    it('should return achievements for a valid user ID', async () => {
      // Mock data
      const mockAchievements = [
        createMockAchievement({ id: 1, title: 'State Champion' }),
        createMockAchievement({ id: 2, title: 'Regional Winner' }),
      ]

      // Mock the database query chain
      const mockWhere = jest.fn().mockResolvedValue(mockAchievements)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements')
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toEqual(mockAchievements)
      expect(mockDb.select).toHaveBeenCalledWith()
      expect(mockFrom).toHaveBeenCalledWith(achievements)
    })

    it('should return empty array for user with no achievements', async () => {
      // Mock empty results
      const mockWhere = jest.fn().mockResolvedValue([])
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements')
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toEqual([])
    })

    it('should handle database errors with proper error response', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      const mockWhere = jest.fn().mockRejectedValue(mockError)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements')
      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await GET(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle invalid user ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockWhere = jest.fn().mockRejectedValue(mockError)
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere })
      mockDb.select.mockReturnValue({ from: mockFrom } as any)

      // Create request and params with invalid user ID
      const req = new NextRequest('http://localhost:3000/api/users/invalid/achievements')
      const params = Promise.resolve({ userId: 'invalid' })

      // Call the API
      const response = await GET(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST /api/users/[userId]/achievements', () => {
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

      // Create request with JSON body
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      })

      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
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

      // Create request with incomplete JSON body
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      })

      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Insert failed')
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

      // Create request with invalid date
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      })

      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid date format')
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

      // Create request
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      })

      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Insert failed')
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

      // Create request with invalid user ID
      const req = new NextRequest('http://localhost:3000/api/users/invalid/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      })

      const params = Promise.resolve({ userId: 'invalid' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Insert failed')
    })

    it('should handle malformed JSON in request body', async () => {
      // Create request with malformed JSON
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const params = Promise.resolve({ userId: '1' })

      // Call the API
      const response = await POST(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
}) 