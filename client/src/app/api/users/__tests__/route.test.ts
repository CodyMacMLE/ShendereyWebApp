/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import {
    createMockUser,
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse
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

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
}))

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-uuid'),
}))

describe('/api/users', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all users with their images successfully', async () => {
      // Mock data
      const mockUsers = [
        createMockUser({ 
          id: 1, 
          name: 'John Doe',
          createdAt: '2025-06-24T18:47:07.037Z',
          updatedAt: '2025-06-24T18:47:07.037Z'
        }),
        createMockUser({ 
          id: 2, 
          name: 'Jane Smith', 
          isAthlete: true,
          createdAt: '2025-06-24T18:47:07.037Z',
          updatedAt: '2025-06-24T18:47:07.037Z'
        }),
      ]

      const mockImages = [
        { staffUrl: 'https://example.com/coach1.jpg', athleteUrl: null, prospectUrl: null, alumniUrl: null },
        { staffUrl: null, athleteUrl: 'https://example.com/athlete2.jpg', prospectUrl: null, alumniUrl: null },
      ]

      // Mock the database queries to return proper query chain
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue(mockUsers),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { user: 1, staffUrl: 'https://example.com/coach1.jpg', athleteUrl: null, prospectUrl: null, alumniUrl: null },
          { user: 2, staffUrl: null, athleteUrl: 'https://example.com/athlete2.jpg', prospectUrl: null, alumniUrl: null },
        ]),
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.data).toHaveLength(2)
      expect(data.data[0]).toEqual({
        ...mockUsers[0],
        images: mockImages[0],
      })
      expect(data.data[1]).toEqual({
        ...mockUsers[1],
        images: mockImages[1],
      })
    })

    it('should return users with null images when no images exist', async () => {
      // Mock data
      const mockUsers = [createMockUser()]
      const mockImages: any[] = []

      // Mock the database queries to return proper query chain
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue(mockUsers),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue(mockImages),
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.data[0].images).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockRejectedValue(mockError),
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle empty users array', async () => {
      // Mock empty results
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.data).toEqual([])
    })
  })

  describe('POST', () => {
    const createMockFormData = (overrides: any = {}) => {
      const formData = new FormData()
      formData.append('name', overrides.name || 'Test User')
      formData.append('isAthlete', overrides.isAthlete || 'false')
      formData.append('isCoach', overrides.isCoach || 'false')
      formData.append('isProspect', overrides.isProspect || 'false')
      formData.append('isAlumni', overrides.isAlumni || 'false')
      formData.append('isSeniorStaff', overrides.isSeniorStaff || 'false')
      
      // Add coach fields if isCoach is true
      if (overrides.isCoach === 'true') {
        formData.append('coachTitle', overrides.coachTitle || 'Head Coach')
        formData.append('coachDescription', overrides.coachDescription || 'Experienced coach')
      }
      
      // Add athlete fields if isAthlete is true
      if (overrides.isAthlete === 'true') {
        formData.append('athleteLevel', overrides.athleteLevel || 'Advanced')
      }
      
      // Add prospect fields if isProspect is true
      if (overrides.isProspect === 'true') {
        formData.append('prospectMajor', overrides.prospectMajor || 'Computer Science')
        formData.append('prospectGPA', overrides.prospectGPA || '3.8')
        formData.append('prospectInstitution', overrides.prospectInstitution || 'University of Test')
        formData.append('prospectGraduationYear', overrides.prospectGraduationYear || '2025-06-01')
        formData.append('prospectDescription', overrides.prospectDescription || 'Promising prospect')
        formData.append('prospectYoutube', overrides.prospectYoutube || 'https://youtube.com/test')
        formData.append('prospectInstagram', overrides.prospectInstagram || 'https://instagram.com/test')
      }
      
      // Add alumni fields if isAlumni is true
      if (overrides.isAlumni === 'true') {
        formData.append('alumniSchool', overrides.alumniSchool || 'Test University')
        formData.append('alumniGraduationYear', overrides.alumniGraduationYear || '2020-06-01')
        formData.append('alumniDescription', overrides.alumniDescription || 'Successful alumni')
      }
      
      return formData
    }

    it('should create a basic user successfully', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData()
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should create a coach user successfully', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData({
        isCoach: 'true',
        coachTitle: 'Assistant Coach',
        coachDescription: 'New coach',
        isSeniorStaff: 'true',
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should create an athlete user successfully', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData({
        isAthlete: 'true',
        athleteLevel: 'Intermediate',
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should create a prospect user successfully', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData({
        isProspect: 'true',
        prospectMajor: 'Engineering',
        prospectGPA: '3.9',
        prospectInstitution: 'MIT',
        prospectGraduationYear: '2026-05-15',
        prospectDescription: 'Top prospect',
        prospectYoutube: 'https://youtube.com/prospect',
        prospectInstagram: 'https://instagram.com/prospect',
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should create an alumni user successfully', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData({
        isAlumni: 'true',
        alumniSchool: 'Stanford University',
        alumniGraduationYear: '2019-06-01',
        alumniDescription: 'Successful graduate',
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should handle prospect with null GPA and graduation year', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const formData = createMockFormData({
        isProspect: 'true',
        prospectMajor: 'Engineering',
        // No GPA or graduation year
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any)

      const formData = createMockFormData()
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database error')
    })

    it('should handle missing required fields', async () => {
      const formData = new FormData()
      // Missing name field
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data)
    })

    it('should handle multiple user types simultaneously', async () => {
      // Mock database insertions
      const mockInsertedUser = [{ id: 1 }]
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(mockInsertedUser),
        }),
      } as any)
      // Multiple additional inserts for different user types
      for (let i = 0; i < 4; i++) {
        mockDb.insert.mockReturnValueOnce({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        } as any)
      }

      const formData = createMockFormData({
        isAthlete: 'true',
        isCoach: 'true',
        isProspect: 'true',
        isAlumni: 'true',
        athleteLevel: 'Advanced',
        coachTitle: 'Head Coach',
        coachDescription: 'Experienced coach',
        prospectMajor: 'Computer Science',
        prospectGPA: '3.8',
        prospectInstitution: 'University of Test',
        prospectGraduationYear: '2025-06-01',
        prospectDescription: 'Multi-talented prospect',
        prospectYoutube: 'https://youtube.com/multi',
        prospectInstagram: 'https://instagram.com/multi',
        alumniSchool: 'Previous University',
        alumniGraduationYear: '2020-06-01',
        alumniDescription: 'Previous graduate',
      })
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })
  })
}) 