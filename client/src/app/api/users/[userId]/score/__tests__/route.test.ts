/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { validateApiResponse, validateErrorResponse, validateSuccessResponse } from '@/test-utils/test-utils.helper'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

describe('/api/users/[userId]/score', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    const createMockScoreData = (overrides: any = {}) => ({
      competitionName: 'Regional Championships',
      competitionDate: '2024-03-15',
      competitionCategory: 'Level 8',
      vaultScore: 9.2,
      barsScore: 8.8,
      beamScore: 9.0,
      floorScore: 9.1,
      overallScore: 36.1,
      ...overrides,
    })

    const createMockRequest = (userId: string, body: any) => {
      const url = `http://localhost:3000/api/users/${userId}/score`
      return new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    it('should create a score successfully', async () => {
      // Mock data
      const userId = '123'
      const scoreData = createMockScoreData()
      const mockInsertedScore = {
        id: 1,
        athlete: 123,
        competition: scoreData.competitionName,
        date: new Date(scoreData.competitionDate),
        category: scoreData.competitionCategory,
        vault: scoreData.vaultScore,
        bars: scoreData.barsScore,
        beam: scoreData.beamScore,
        floor: scoreData.floorScore,
        overall: scoreData.overallScore,
      }

      // Mock database insertion
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedScore]),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedScore)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })

    it('should handle invalid user ID', async () => {
      // Mock data with invalid user ID
      const userId = 'invalid'
      const scoreData = createMockScoreData()

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Invalid user ID')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should handle user ID of 0', async () => {
      // Mock data with user ID of 0
      const userId = '0'
      const scoreData = createMockScoreData()

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Invalid user ID')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should handle missing competition date', async () => {
      // Mock data without competition date
      const userId = '123'
      const scoreData = createMockScoreData({ competitionDate: '' })
      const mockInsertedScore = {
        id: 1,
        athlete: 123,
        competition: scoreData.competitionName,
        date: null,
        category: scoreData.competitionCategory,
        vault: scoreData.vaultScore,
        bars: scoreData.barsScore,
        beam: scoreData.beamScore,
        floor: scoreData.floorScore,
        overall: scoreData.overallScore,
      }

      // Mock database insertion
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedScore]),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedScore)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors', async () => {
      // Mock data
      const userId = '123'
      const scoreData = createMockScoreData()
      const mockError = new Error('Database connection failed')

      // Mock database error
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle malformed JSON', async () => {
      // Create request with malformed JSON
      const userId = '123'
      const request = new NextRequest(`http://localhost:3000/api/users/${userId}/score`, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle negative scores', async () => {
      // Mock data with negative scores
      const userId = '123'
      const scoreData = createMockScoreData({
        vaultScore: -1.0,
        barsScore: -2.0,
        beamScore: -1.5,
        floorScore: -0.5,
        overallScore: -5.0,
      })
      const mockInsertedScore = {
        id: 1,
        athlete: 123,
        competition: scoreData.competitionName,
        date: new Date(scoreData.competitionDate),
        category: scoreData.competitionCategory,
        vault: scoreData.vaultScore,
        bars: scoreData.barsScore,
        beam: scoreData.beamScore,
        floor: scoreData.floorScore,
        overall: scoreData.overallScore,
      }

      // Mock database insertion
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedScore]),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId, scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedScore)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET', () => {
    const createMockRequest = (userId: string) => {
      return new NextRequest(`http://localhost:3000/api/users/${userId}/score`)
    }

    it('should return user scores successfully', async () => {
      // Mock data
      const userId = '123'
      const mockScores = [
        {
          id: 1,
          athlete: 123,
          competition: 'Regional Championships',
          date: new Date('2024-03-15'),
          category: 'Level 8',
          vault: 9.2,
          bars: 8.8,
          beam: 9.0,
          floor: 9.1,
          overall: 36.1,
        },
        {
          id: 2,
          athlete: 123,
          competition: 'State Championships',
          date: new Date('2024-04-20'),
          category: 'Level 8',
          vault: 9.0,
          bars: 9.1,
          beam: 8.9,
          floor: 9.3,
          overall: 36.3,
        },
      ]

      // Mock database query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockScores),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId)
      const params = Promise.resolve({ userId })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockScores)
      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when user has no scores', async () => {
      // Mock data
      const userId = '123'
      const mockScores: any[] = []

      // Mock database query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockScores),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId)
      const params = Promise.resolve({ userId })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors', async () => {
      // Mock data
      const userId = '123'
      const mockError = new Error('Database connection failed')

      // Mock database error
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId)
      const params = Promise.resolve({ userId })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle non-numeric user ID', async () => {
      // Mock data
      const userId = 'abc'
      const mockScores: any[] = []

      // Mock database query (should still work as parseInt returns NaN but query might still execute)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockScores),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId)
      const params = Promise.resolve({ userId })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })

    it('should handle scores with null values', async () => {
      // Mock data with null values
      const userId = '123'
      const mockScores = [
        {
          id: 1,
          athlete: 123,
          competition: 'Regional Championships',
          date: null,
          category: 'Level 8',
          vault: 9.2,
          bars: null,
          beam: 9.0,
          floor: 9.1,
          overall: 36.1,
        },
      ]

      // Mock database query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockScores),
        }),
      } as any)

      // Create request
      const request = createMockRequest(userId)
      const params = Promise.resolve({ userId })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockScores)
      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })
  })
}) 