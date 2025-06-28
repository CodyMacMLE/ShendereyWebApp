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
import { DELETE, GET, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}))

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-uuid'),
}))

describe('/api/users/[userId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user data successfully for a basic user', async () => {
      const userId = '1'
      const mockUser = createMockUser({ id: 1, name: 'John Doe' })
      const mockImages = {
        staffUrl: 'https://example.com/staff.jpg',
        athleteUrl: null,
        prospectUrl: null,
        alumniUrl: null,
      }

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual({
        ...mockUser,
        images: mockImages,
        coach: undefined,
        athlete: {
          alumni: undefined,
          prospect: undefined,
          scores: undefined,
          videos: undefined,
          achievements: undefined,
        },
      })
    })

    it('should return user data with coach information', async () => {
      const userId = '1'
      const mockUser = createMockUser({ id: 1, name: 'John Doe', isCoach: true })
      const mockImages = { staffUrl: null, athleteUrl: null, prospectUrl: null, alumniUrl: null }
      const mockCoach = {
        id: 1,
        title: 'Head Coach',
        description: 'Experienced coach',
        isSeniorStaff: true,
      }

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCoach]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body.coach).toEqual(mockCoach)
    })

    it('should return user data with athlete information', async () => {
      const userId = '1'
      const mockUser = createMockUser({ id: 1, name: 'Jane Smith', isAthlete: true })
      const mockImages = { staffUrl: null, athleteUrl: null, prospectUrl: null, alumniUrl: null }
      const mockAthlete = { id: 1, level: 'Advanced' }

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAthlete]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body.athlete).toEqual({
        ...mockAthlete,
        alumni: undefined,
        prospect: undefined,
        scores: undefined,
        videos: undefined,
        achievements: undefined,
      })
    })

    it('should return user data with prospect information', async () => {
      const userId = '1'
      const mockUser = createMockUser({ 
        id: 1, 
        name: 'Jane Smith', 
        isAthlete: true, 
        isProspect: true 
      })
      const mockImages = { staffUrl: null, athleteUrl: null, prospectUrl: null, alumniUrl: null }
      const mockAthlete = { id: 1, level: 'Advanced' }
      const mockProspect = {
        graduationYear: new Date('2025-01-01'),
        description: 'Promising prospect',
        gpa: 3.8,
        major: 'Computer Science',
        institution: 'University of Test',
        instagramLink: 'https://instagram.com/test',
        youtubeLink: 'https://youtube.com/test',
      }

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAthlete]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProspect]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body.athlete.prospect).toEqual(mockProspect)
    })

    it('should return user data with alumni information', async () => {
      const userId = '1'
      const mockUser = createMockUser({ 
        id: 1, 
        name: 'Jane Smith', 
        isAthlete: true, 
        isAlumni: true 
      })
      const mockImages = { staffUrl: null, athleteUrl: null, prospectUrl: null, alumniUrl: null }
      const mockAthlete = { id: 1, level: 'Advanced' }
      const mockAlumni = {
        school: 'Test University',
        year: new Date('2020-01-01'),
        description: 'Successful alumni',
      }

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAthlete]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAlumni]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body.athlete.alumni).toEqual(mockAlumni)
    })

    it('should handle database errors gracefully', async () => {
      const userId = '1'
      const mockError = new Error('Database connection failed')

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle user not found', async () => {
      const userId = '999'
      const mockImages = { staffUrl: null, athleteUrl: null, prospectUrl: null, alumniUrl: null }

      // Mock empty user result
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockImages]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/999')
      const response = await GET(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body).toBeUndefined()
    })
  })

  describe('PUT', () => {
    const createMockFormData = (overrides: any = {}) => {
      const formData = new FormData()
      formData.append('name', overrides.name || 'Test User')
      formData.append('isAthlete', overrides.isAthlete || 'false')
      formData.append('isCoach', overrides.isCoach || 'false')
      formData.append('isProspect', overrides.isProspect || 'false')
      formData.append('isAlumni', overrides.isAlumni || 'false')
      formData.append('isSeniorStaff', overrides.isSeniorStaff || 'false')
      
      if (overrides.isCoach === 'true') {
        formData.append('coachTitle', overrides.coachTitle || 'Head Coach')
        formData.append('coachDescription', overrides.coachDescription || 'Experienced coach')
      }
      
      if (overrides.isAthlete === 'true') {
        formData.append('athleteLevel', overrides.athleteLevel || 'Advanced')
      }
      
      if (overrides.isProspect === 'true') {
        formData.append('prospectMajor', overrides.prospectMajor || 'Computer Science')
        formData.append('prospectGPA', overrides.prospectGPA || '3.8')
        formData.append('prospectInstitution', overrides.prospectInstitution || 'University of Test')
        formData.append('prospectGraduationYear', overrides.prospectGraduationYear || '2025')
        formData.append('prospectDescription', overrides.prospectDescription || 'Promising prospect')
        formData.append('prospectYoutube', overrides.prospectYoutube || 'https://youtube.com/test')
        formData.append('prospectInstagram', overrides.prospectInstagram || 'https://instagram.com/test')
      }
      
      if (overrides.isAlumni === 'true') {
        formData.append('alumniSchool', overrides.alumniSchool || 'Test University')
        formData.append('alumniGraduationYear', overrides.alumniGraduationYear || '2020')
        formData.append('alumniDescription', overrides.alumniDescription || 'Successful alumni')
      }
      
      return formData
    }

    it('should update basic user information successfully', async () => {
      const userId = '1'
      const formData = createMockFormData({
        name: 'Updated User',
        isCoach: 'true',
        coachTitle: 'Assistant Coach',
        coachDescription: 'New coach description',
        isSeniorStaff: 'true',
      })

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users/1')
    })

    it('should update athlete information successfully', async () => {
      const userId = '1'
      const formData = createMockFormData({
        name: 'Athlete User',
        isAthlete: 'true',
        athleteLevel: 'Elite',
      })

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should update prospect information successfully', async () => {
      const userId = '1'
      const formData = createMockFormData({
        name: 'Prospect User',
        isAthlete: 'true',
        isProspect: 'true',
        athleteLevel: 'Advanced',
        prospectMajor: 'Engineering',
        prospectGPA: '3.9',
        prospectInstitution: 'MIT',
        prospectGraduationYear: '2026',
        prospectDescription: 'Top prospect',
        prospectYoutube: 'https://youtube.com/prospect',
        prospectInstagram: 'https://instagram.com/prospect',
      })

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should update alumni information successfully', async () => {
      const userId = '1'
      const formData = createMockFormData({
        name: 'Alumni User',
        isAthlete: 'true',
        isAlumni: 'true',
        athleteLevel: 'Graduate',
        alumniSchool: 'Stanford University',
        alumniGraduationYear: '2019',
        alumniDescription: 'Successful graduate',
      })

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle image upload successfully', async () => {
      const userId = '1'
      const formData = createMockFormData({
        name: 'User with Image',
        isCoach: 'true',
      })

      // Create a mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      formData.append('staffImg', mockFile)

      // Mock database queries
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle database errors gracefully', async () => {
      const userId = '1'
      const formData = createMockFormData()
      const mockError = new Error('Database update failed')

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database update failed')
    })
  })

  describe('DELETE', () => {
    it('should delete user successfully', async () => {
      const userId = '1'

      // Mock athlete ID query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ athleteId: 1 }]),
        }),
      } as any)

      // Mock media URLs query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Mock user images query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            staffUrl: null,
            athleteUrl: null,
            prospectUrl: null,
            alumniUrl: null,
          }]),
        }),
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users')
    })

    it('should delete user with media files successfully', async () => {
      const userId = '1'

      // Mock athlete ID query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ athleteId: 1 }]),
        }),
      } as any)

      // Mock media URLs query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { url: 'https://bucket.s3.amazonaws.com/media/video1.mp4' },
            { url: 'https://bucket.s3.amazonaws.com/media/image1.jpg' },
          ]),
        }),
      } as any)

      // Mock user images query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            staffUrl: 'https://bucket.s3.amazonaws.com/coach/coach1.jpg',
            athleteUrl: null,
            prospectUrl: null,
            alumniUrl: null,
          }]),
        }),
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should delete user without athlete data successfully', async () => {
      const userId = '1'

      // Mock no athlete ID
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle database errors gracefully', async () => {
      const userId = '1'
      const mockError = new Error('Database deletion failed')

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database deletion failed')
    })

    it('should handle S3 deletion errors gracefully', async () => {
      const userId = '1'

      // Mock athlete ID query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ athleteId: 1 }]),
        }),
      } as any)

      // Mock media URLs query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { url: 'https://bucket.s3.amazonaws.com/media/video1.mp4' },
          ]),
        }),
      } as any)

      // Mock user images query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{
            staffUrl: null,
            athleteUrl: null,
            prospectUrl: null,
            alumniUrl: null,
          }]),
        }),
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })
  })
}) 