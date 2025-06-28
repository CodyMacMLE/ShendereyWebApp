/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { tryouts } from '@/lib/schema'
import {
    validateApiResponse
} from '@/test-utils/test-utils.helper'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
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

// Helper function to create mock tryout form data
const createMockTryoutFormData = (overrides: Partial<any> = {}) => ({
  athleteName: 'John Smith',
  DoB: '2010-05-15',
  about: 'Experienced gymnast looking to join competitive program',
  experienceProgram: 'Recreational',
  experienceLevel: 'Intermediate',
  experienceYears: '3',
  hoursPerWeek: '8',
  currentClub: 'Local Gym Club',
  currentCoach: 'Coach Johnson',
  tryoutPreference: 'Competitive program',
  tryoutLevel: 'Advanced',
  contactName: 'Jane Smith',
  contactRelationship: 'Parent',
  contactEmail: 'jane.smith@email.com',
  contactPhone: '555-123-4567',
  honeypot: '',
  ...overrides,
})

describe('/api/tryouts', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all tryouts successfully', async () => {
      // Mock tryout data
      const mockTryouts = [
        createMockTryout({ id: 1, athleteName: 'John Smith' }),
        createMockTryout({ id: 2, athleteName: 'Sarah Johnson' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockTryouts)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toEqual(mockTryouts)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should return 404 when no tryouts found', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(null)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 404)
      expect(data.error).toBe('No tryouts found')
    })

    it('should return empty array when no tryouts exist', async () => {
      // Mock empty array result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([])
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.body).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to fetch tryouts')
    })

    it('should handle unknown errors gracefully', async () => {
      // Mock unknown error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockRejectedValue('Unknown error')
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to fetch tryouts')
    })
  })

  describe('POST', () => {
    it('should create a new tryout successfully', async () => {
      // Mock form data
      const formData = createMockTryoutFormData()

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.success).toBe('Tryout form submitted successfully')
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
    })

    it('should reject submission when honeypot is filled', async () => {
      // Mock form data with honeypot filled
      const formData = createMockTryoutFormData({ honeypot: 'spam' })

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      expect(data.error).toBe('Spam detected')
    })

    it('should return message when email already exists', async () => {
      // Mock form data
      const formData = createMockTryoutFormData()

      // Mock existing email
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([createMockTryout()])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.message).toBe('Email already exists')
    })

    it('should handle missing required fields gracefully', async () => {
      // Mock form data with missing fields
      const formData = {
        athleteName: 'John Smith',
        // Missing other required fields
      }

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should handle database insertion errors gracefully', async () => {
      // Mock form data
      const formData = createMockTryoutFormData()

      // Mock email check passing
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      // Mock database insertion error
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('Insert failed'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should handle malformed request body', async () => {
      // Create mock request with invalid body
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: 'invalid json body',
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should trim whitespace from string fields', async () => {
      // Mock form data with extra whitespace
      const formData = createMockTryoutFormData({
        athleteName: '  John Smith  ',
        contactEmail: '  jane.smith@email.com  ',
        contactPhone: '  555-123-4567  ',
      })

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.success).toBe('Tryout form submitted successfully')
      
      // Verify that values were trimmed by checking the mock call
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })

    it('should convert string numbers to integers', async () => {
      // Mock form data
      const formData = createMockTryoutFormData({
        experienceYears: '5',
        hoursPerWeek: '12',
      })

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.success).toBe('Tryout form submitted successfully')
      
      // Verify that string numbers were converted to integers by checking the mock call
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })

    it('should convert date string to Date object', async () => {
      // Mock form data
      const formData = createMockTryoutFormData({
        DoB: '2010-05-15',
      })

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      expect(data.success).toBe('Tryout form submitted successfully')
      
      // Verify that date string was converted to Date object by checking the mock call
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
      expect(mockDb.insert).toHaveBeenCalledTimes(1)
    })
  })
}) 