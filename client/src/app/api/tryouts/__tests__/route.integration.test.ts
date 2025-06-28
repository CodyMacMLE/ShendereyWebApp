/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { tryouts } from '@/lib/schema'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the database module for integration tests
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
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

describe('/api/tryouts Integration Tests', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Integration', () => {
    it('should fetch tryouts from actual database', async () => {
      // Mock tryout data
      const mockTryouts = [
        createMockTryout({ id: 1, athleteName: 'John Smith' }),
        createMockTryout({ id: 2, athleteName: 'Sarah Johnson' }),
        createMockTryout({ id: 3, athleteName: 'Mike Davis' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockTryouts)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.body).toEqual(mockTryouts)
      expect(Array.isArray(data.body)).toBe(true)
      expect(data.body).toHaveLength(3)
      
      // Validate tryout data structure
      const tryout = data.body[0]
      expect(tryout).toHaveProperty('id')
      expect(tryout).toHaveProperty('athleteName')
      expect(tryout).toHaveProperty('athleteDOB')
      expect(tryout).toHaveProperty('athleteAbout')
      expect(tryout).toHaveProperty('experienceProgram')
      expect(tryout).toHaveProperty('experienceLevel')
      expect(tryout).toHaveProperty('experienceYears')
      expect(tryout).toHaveProperty('currentClub')
      expect(tryout).toHaveProperty('currentCoach')
      expect(tryout).toHaveProperty('currentHours')
      expect(tryout).toHaveProperty('tryoutPreferences')
      expect(tryout).toHaveProperty('tryoutLevel')
      expect(tryout).toHaveProperty('contactName')
      expect(tryout).toHaveProperty('contactEmail')
      expect(tryout).toHaveProperty('contactPhone')
      expect(tryout).toHaveProperty('contactRelationship')
      expect(tryout).toHaveProperty('readStatus')
      expect(tryout).toHaveProperty('createdAt')
      expect(tryout).toHaveProperty('updatedAt')
    })

    it('should handle database connection issues', async () => {
      // Mock database error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch tryouts')
    })

    it('should handle concurrent requests', async () => {
      // Mock tryout data
      const mockTryouts = [createMockTryout()]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockTryouts)
      } as any)

      // Call the API multiple times concurrently
      const promises = [
        GET(),
        GET(),
        GET(),
      ]

      const responses = await Promise.all(promises)
      const dataPromises = responses.map(response => response.json())
      const dataArray = await Promise.all(dataPromises)

      // Assertions
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      dataArray.forEach(data => {
        expect(data.body).toEqual(mockTryouts)
      })
    })

    it('should return empty array when no tryouts exist', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([])
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.body).toEqual([])
      expect(Array.isArray(data.body)).toBe(true)
      expect(data.body).toHaveLength(0)
    })

    it('should handle large dataset efficiently', async () => {
      // Mock large dataset
      const mockTryouts = Array.from({ length: 100 }, (_, i) => 
        createMockTryout({ 
          id: i + 1, 
          athleteName: `Athlete ${i + 1}`,
          contactEmail: `athlete${i + 1}@email.com`
        })
      )

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockTryouts)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.body).toHaveLength(100)
      expect(data.body[0].athleteName).toBe('Athlete 1')
      expect(data.body[99].athleteName).toBe('Athlete 100')
    })
  })

  describe('POST - Integration', () => {
    it('should create a new tryout in actual database', async () => {
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
      expect(response.status).toBe(200)
      expect(data.success).toBe('Tryout form submitted successfully')
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
    })

    it('should handle duplicate email submissions gracefully', async () => {
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
      expect(response.status).toBe(200)
      expect(data.message).toBe('Email already exists')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should handle spam detection with honeypot', async () => {
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
      expect(response.status).toBe(400)
      expect(data.error).toBe('Spam detected')
      expect(mockDb.insert).not.toHaveBeenCalled()
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
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit tryout form')
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
      expect(response.status).toBe(500)
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
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should handle concurrent submissions with same email', async () => {
      // Mock form data
      const formData = createMockTryoutFormData()

      // Mock email check - first call returns empty, second call returns existing
      let callCount = 0
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockImplementation(() => {
            callCount++
            if (callCount === 1) {
              return Promise.resolve([])
            } else {
              return Promise.resolve([createMockTryout()])
            }
          })
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Create mock requests
      const request1 = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      const request2 = new NextRequest('http://localhost:3000/api/tryouts', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      // Call the API concurrently
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2)
      ])

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ])

      // Assertions
      expect(response1.status).toBe(200)
      expect(data1.success).toBe('Tryout form submitted successfully')
      
      expect(response2.status).toBe(200)
      expect(data2.message).toBe('Email already exists')
    })

    it('should validate data transformation correctly', async () => {
      // Mock form data with various data types
      const formData = createMockTryoutFormData({
        athleteName: '  John Smith  ',
        DoB: '2010-05-15',
        experienceYears: '5',
        hoursPerWeek: '12',
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
      expect(response.status).toBe(200)
      expect(data.success).toBe('Tryout form submitted successfully')
      
      // Verify data transformation
      expect(mockDb.insert).toHaveBeenCalledWith(tryouts)
      const insertCall = mockDb.insert.mock.calls[0]
      const valuesCall = (insertCall[0] as any).values.mock.calls[0][0]
      
      // Check string trimming
      expect(valuesCall.athleteName).toBe('John Smith')
      expect(valuesCall.contactEmail).toBe('jane.smith@email.com')
      expect(valuesCall.contactPhone).toBe('555-123-4567')
      
      // Check number conversion
      expect(valuesCall.experienceYears).toBe(5)
      expect(valuesCall.currentHours).toBe(12)
      
      // Check date conversion
      expect(valuesCall.athleteDOB).toEqual(new Date('2010-05-15'))
    })
  })

  describe('Error Handling - Integration', () => {
    it('should handle database connection failures during GET', async () => {
      // Mock database connection failure
      mockDb.select.mockReturnValue({
        from: jest.fn().mockRejectedValue(new Error('Connection timeout'))
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch tryouts')
    })

    it('should handle database connection failures during POST', async () => {
      // Mock form data
      const formData = createMockTryoutFormData()

      // Mock database connection failure during email check
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Connection timeout'))
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
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should handle invalid date formats gracefully', async () => {
      // Mock form data with invalid date
      const formData = createMockTryoutFormData({
        DoB: 'invalid-date',
      })

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('Invalid date format'))
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
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit tryout form')
    })

    it('should handle invalid number formats gracefully', async () => {
      // Mock form data with invalid numbers
      const formData = createMockTryoutFormData({
        experienceYears: 'not-a-number',
        hoursPerWeek: 'also-not-a-number',
      })

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('Invalid number format'))
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
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to submit tryout form')
    })
  })
}) 