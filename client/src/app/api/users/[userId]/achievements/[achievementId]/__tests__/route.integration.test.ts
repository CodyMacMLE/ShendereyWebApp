/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { achievements } from '@/lib/schema'
import { NextRequest } from 'next/server'
import { DELETE } from '../route'

// Mock the database module for integration tests
jest.mock('@/lib/db', () => ({
  db: {
    delete: jest.fn(),
  },
}))

describe('/api/users/[userId]/achievements/[achievementId] - Integration Tests', () => {
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
    date: '2024-01-15T00:00:00.000Z',
    ...overrides,
  })

  describe('DELETE /api/users/[userId]/achievements/[achievementId]', () => {
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

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '1', achievementId: '1' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toEqual(mockDeletedAchievement)
      expect(mockDb.delete).toHaveBeenCalledWith(achievements)
    })

    it('should return null when achievement does not exist', async () => {
      // Mock empty results (achievement not found)
      const mockReturning = jest.fn().mockResolvedValue([])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements/999', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '1', achievementId: '999' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toBeNull()
    })

    it('should handle database errors with proper error response', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '1', achievementId: '1' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle invalid user ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with invalid user ID
      const req = new NextRequest('http://localhost:3000/api/users/invalid/achievements/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: 'invalid', achievementId: '1' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle invalid achievement ID gracefully', async () => {
      // Mock database error for invalid ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with invalid achievement ID
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements/invalid', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '1', achievementId: 'invalid' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle both invalid user ID and achievement ID', async () => {
      // Mock database error for invalid IDs
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with both invalid IDs
      const req = new NextRequest('http://localhost:3000/api/users/invalid/achievements/invalid', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: 'invalid', achievementId: 'invalid' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle missing user ID', async () => {
      // Mock database error for missing ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with missing user ID
      const req = new NextRequest('http://localhost:3000/api/users//achievements/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '', achievementId: '1' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle missing achievement ID', async () => {
      // Mock database error for missing ID
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with missing achievement ID
      const req = new NextRequest('http://localhost:3000/api/users/1/achievements/', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '1', achievementId: '' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle non-numeric user ID and achievement ID', async () => {
      // Mock database error for non-numeric IDs
      const mockError = new Error('Database connection failed')
      const mockReturning = jest.fn().mockRejectedValue(mockError)
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with non-numeric IDs
      const req = new NextRequest('http://localhost:3000/api/users/abc/achievements/def', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: 'abc', achievementId: 'def' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle very large numeric IDs', async () => {
      // Mock data for large IDs
      const mockDeletedAchievement = createMockAchievement({
        id: 999999,
        athlete: 999999,
      })

      // Mock the database delete chain
      const mockReturning = jest.fn().mockResolvedValue([mockDeletedAchievement])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with large IDs
      const req = new NextRequest('http://localhost:3000/api/users/999999/achievements/999999', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '999999', achievementId: '999999' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toEqual(mockDeletedAchievement)
    })

    it('should handle zero IDs', async () => {
      // Mock empty results for zero IDs
      const mockReturning = jest.fn().mockResolvedValue([])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      mockDb.delete.mockReturnValue({ where: mockWhere } as any)

      // Create request and params with zero IDs
      const req = new NextRequest('http://localhost:3000/api/users/0/achievements/0', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ userId: '0', achievementId: '0' })

      // Call the API
      const response = await DELETE(req, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toBeNull()
    })
  })
}) 