/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { tryouts } from '@/lib/schema'
import {
    validateApiResponse
} from '@/test-utils/test-utils.helper'
import { NextRequest } from 'next/server'
import { DELETE, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    json: jest.fn().mockImplementation(() => {
      if (options?.body) {
        try {
          return Promise.resolve(JSON.parse(options.body))
        } catch {
          return Promise.reject(new Error('Invalid JSON'))
        }
      }
      return Promise.resolve({})
    }),
  })),
}))

// Helper function to create mock tryout data
const createMockTryout = (overrides: Partial<any> = {}) => ({
  id: 1,
  athleteName: 'John Smith',
  athleteDOB: new Date('2010-05-15'),
  athleteAbout: 'Experienced gymnast looking to join competitive program',
  experienceProgram: 'Recreational',
  experienceLevel: 'Intermediate',
  experienceYears: 3,
  currentClub: 'Local Gym Club',
  currentCoach: 'Coach Johnson',
  currentHours: 8,
  tryoutPreferences: 'Competitive program',
  tryoutLevel: 'Advanced',
  contactName: 'Jane Smith',
  contactEmail: 'jane.smith@email.com',
  contactPhone: '555-123-4567',
  contactRelationship: 'Parent',
  readStatus: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('/api/tryouts/[tryoutId]', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT', () => {
    it('should update tryout read status successfully', async () => {
      // Mock tryout data
      const mockTryout = createMockTryout({ id: 1, readStatus: true })
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock the database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTryout])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'PUT',
        body: JSON.stringify({ readStatus: true }),
      })

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toEqual([mockTryout])
      expect(mockDb.update).toHaveBeenCalledWith(tryouts)
    })

    it('should return 404 when tryout not found', async () => {
      const params = Promise.resolve({ tryoutId: '999' })

      // Mock the database update with no result
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(null)
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/999', {
        method: 'PUT',
        body: JSON.stringify({ readStatus: true }),
      })

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 404)
      expect(data.error).toBe('No tryout found')
    })

    it('should handle invalid tryout ID', async () => {
      const params = Promise.resolve({ tryoutId: 'invalid' })

      // Mock the database update with error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Invalid ID'))
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/invalid', {
        method: 'PUT',
        body: JSON.stringify({ readStatus: true }),
      })

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to update tryout')
    })

    it('should handle database errors gracefully', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock database error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database connection failed'))
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'PUT',
        body: JSON.stringify({ readStatus: true }),
      })

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to update tryout')
    })

    it('should handle invalid JSON in request body', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Create mock request with invalid JSON
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'PUT',
        body: 'invalid json',
      })

      // Mock the request.json to throw error
      jest.spyOn(request, 'json').mockRejectedValue(new Error('Invalid JSON'))

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to update tryout')
    })

    it('should handle missing readStatus in request body', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Create mock request with missing readStatus
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      // Mock the database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([createMockTryout()])
        })
      } as any)

      // Call the API
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toBeDefined()
    })
  })

  describe('DELETE', () => {
    it('should delete tryout successfully', async () => {
      // Mock tryout data
      const mockTryout = createMockTryout({ id: 1 })
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([mockTryout])
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toEqual([mockTryout])
      expect(mockDb.delete).toHaveBeenCalledWith(tryouts)
    })

    it('should return 404 when tryout not found for deletion', async () => {
      const params = Promise.resolve({ tryoutId: '999' })

      // Mock the database delete with no result
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(null)
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/999', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 404)
      expect(data.error).toBe('No tryout found')
    })

    it('should handle invalid tryout ID for deletion', async () => {
      const params = Promise.resolve({ tryoutId: 'invalid' })

      // Mock the database delete with error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Invalid ID'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/invalid', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to delete tryout')
    })

    it('should handle database errors gracefully during deletion', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock database error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to delete tryout')
    })

    it('should handle unknown errors during deletion', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock unknown error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue('Unknown error')
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to delete tryout')
    })

    it('should handle empty result from deletion', async () => {
      const params = Promise.resolve({ tryoutId: '1' })

      // Mock empty result
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([])
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toEqual([])
    })
  })
}) 