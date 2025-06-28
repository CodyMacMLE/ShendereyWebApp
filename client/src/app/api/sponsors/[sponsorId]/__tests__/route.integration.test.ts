/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { sponsors } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { DELETE, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
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
  randomUUID: jest.fn().mockReturnValue('test-uuid-123'),
}))

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}))

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    AWS_REGION: 'us-east-1',
    AWS_BUCKET_NAME: 'test-bucket',
  }
})

afterAll(() => {
  process.env = originalEnv
})

// Helper function to create mock file
const createMockFile = (name: string, type: string, content: string = 'test-content'): File => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

// Helper function to create mock sponsor data
const createMockSponsor = (overrides: Partial<any> = {}) => ({
  id: 1,
  organization: 'Test Organization',
  sponsorLevel: 'Gold' as const,
  description: 'Test sponsor description',
  website: 'https://test-organization.com',
  sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/test-uuid-123-test.jpg',
  ...overrides,
})

describe('/api/sponsors/[sponsorId] Integration Tests', () => {
  const mockDb = db as jest.Mocked<typeof db>
  const mockEq = eq as jest.MockedFunction<typeof eq>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should delete a sponsor with image and return success', async () => {
      const sponsorId = '1'
      const mockSponsor = createMockSponsor({ 
        id: 1, 
        organization: 'Gold Sponsor',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-gold-image.jpg' 
      })

      // Mock database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSponsor])
        })
      } as any)

      // Mock database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Mock eq function
      mockEq.mockReturnValue('id = 1' as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toBe(1)
      
      // Verify database calls
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.delete).toHaveBeenCalledWith(sponsors)
    })

    it('should delete a sponsor without image successfully', async () => {
      const sponsorId = '2'
      const mockSponsor = createMockSponsor({ 
        id: 2, 
        organization: 'Silver Sponsor',
        sponsorLevel: 'Silver',
        sponsorImgUrl: null 
      })

      // Mock database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSponsor])
        })
      } as any)

      // Mock database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined)
      } as any)

      // Mock eq function
      mockEq.mockReturnValue('id = 2' as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/2', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toBe(2)
    })

    it('should handle missing sponsor ID with proper error response', async () => {
      const sponsorId = ''

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing sponsor ID')
    })

    it('should handle non-numeric sponsor ID with proper error response', async () => {
      const sponsorId = 'abc123'

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/abc123', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing sponsor ID')
    })

    it('should handle database connection failures gracefully', async () => {
      const sponsorId = '1'

      // Mock database error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database connection timeout'))
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection timeout')
    })

    it('should handle database delete failures gracefully', async () => {
      const sponsorId = '1'
      const mockSponsor = createMockSponsor({ 
        id: 1, 
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/failing-image.jpg' 
      })

      // Mock database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSponsor])
        })
      } as any)

      // Mock database delete error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Database delete failed'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database delete failed')
    })
  })

  describe('PUT', () => {
    it('should update a sponsor with new image successfully', async () => {
      const sponsorId = '1'
      const mockFile = createMockFile('new-platinum-sponsor.jpg', 'image/jpeg', 'new-image-content')
      const formData = new FormData()
      formData.append('organization', 'Platinum Sponsor Updated')
      formData.append('sponsorLevel', 'Platinum')
      formData.append('description', 'Updated platinum level sponsor description')
      formData.append('website', 'https://platinum-sponsor-updated.com')
      formData.append('media', mockFile)

      const existingSponsor = createMockSponsor({ 
        id: 1, 
        organization: 'Old Platinum Sponsor',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-platinum-image.jpg' 
      })
      const updatedSponsor = createMockSponsor({
        id: 1,
        organization: 'Platinum Sponsor Updated',
        sponsorLevel: 'Platinum',
        description: 'Updated platinum level sponsor description',
        website: 'https://platinum-sponsor-updated.com',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsors/test-uuid-123-new-platinum-sponsor.jpg',
      })

      // Mock database select for existing sponsor
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingSponsor])
        })
      } as any)

      // Mock database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedSponsor])
          })
        })
      } as any)

      // Mock eq function
      mockEq.mockReturnValue('id = 1' as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 1)
      expect(data.body.organization).toBe('Platinum Sponsor Updated')
      expect(data.body.sponsorLevel).toBe('Platinum')
      expect(data.body.description).toBe('Updated platinum level sponsor description')
      expect(data.body.website).toBe('https://platinum-sponsor-updated.com')
      expect(data.body.sponsorImgUrl).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/sponsors/')
      
      expect(mockDb.update).toHaveBeenCalledWith(sponsors)
    })

    it('should update a sponsor without new image successfully', async () => {
      const sponsorId = '2'
      const formData = new FormData()
      formData.append('organization', 'Silver Sponsor Text Update')
      formData.append('sponsorLevel', 'Silver')
      formData.append('description', 'Updated silver sponsor with text changes only')
      formData.append('website', 'https://silver-sponsor-text-update.com')

      const updatedSponsor = createMockSponsor({
        id: 2,
        organization: 'Silver Sponsor Text Update',
        sponsorLevel: 'Silver',
        description: 'Updated silver sponsor with text changes only',
        website: 'https://silver-sponsor-text-update.com',
        sponsorImgUrl: null,
      })

      // Mock database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedSponsor])
          })
        })
      } as any)

      // Mock eq function
      mockEq.mockReturnValue('id = 2' as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/2', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 2)
      expect(data.body.organization).toBe('Silver Sponsor Text Update')
      expect(data.body.sponsorLevel).toBe('Silver')
      expect(data.body.description).toBe('Updated silver sponsor with text changes only')
      expect(data.body.website).toBe('https://silver-sponsor-text-update.com')
      expect(data.body.sponsorImgUrl).toBeNull()
      
      expect(mockDb.update).toHaveBeenCalledWith(sponsors)
    })

    it('should handle missing sponsor ID with proper error response', async () => {
      const sponsorId = ''
      const formData = new FormData()
      formData.append('organization', 'Test Organization')

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing sponsor ID')
    })

    it('should handle non-numeric sponsor ID with proper error response', async () => {
      const sponsorId = 'xyz789'
      const formData = new FormData()
      formData.append('organization', 'Test Organization')

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/xyz789', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing sponsor ID')
    })

    it('should handle database update failures gracefully', async () => {
      const sponsorId = '1'
      const formData = new FormData()
      formData.append('organization', 'Database Failure Sponsor')
      formData.append('sponsorLevel', 'Gold')
      formData.append('description', 'This update will fail')
      formData.append('website', 'https://database-failure-sponsor.com')

      // Mock database update error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error('Database constraint violation'))
          })
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database constraint violation')
    })

    it('should handle form data with empty strings correctly', async () => {
      const sponsorId = '1'
      const formData = new FormData()
      formData.append('organization', '')
      formData.append('sponsorLevel', '')
      formData.append('description', '')
      formData.append('website', '')

      const updatedSponsor = createMockSponsor({
        id: 1,
        organization: null,
        sponsorLevel: null,
        description: null,
        website: null,
        sponsorImgUrl: null,
      })

      // Mock database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedSponsor])
          })
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.organization).toBeNull()
      expect(data.body.sponsorLevel).toBeNull()
      expect(data.body.description).toBeNull()
      expect(data.body.website).toBeNull()
    })

    it('should validate sponsor data structure in response', async () => {
      const sponsorId = '1'
      const formData = new FormData()
      formData.append('organization', 'Valid Structure Sponsor')
      formData.append('sponsorLevel', 'Diamond')
      formData.append('description', 'Testing data structure validation')
      formData.append('website', 'https://valid-structure-sponsor.com')

      const updatedSponsor = createMockSponsor({
        id: 1,
        organization: 'Valid Structure Sponsor',
        sponsorLevel: 'Diamond',
        description: 'Testing data structure validation',
        website: 'https://valid-structure-sponsor.com',
        sponsorImgUrl: null,
      })

      // Mock database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedSponsor])
          })
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Validate sponsor data structure
      const sponsor = data.body
      expect(sponsor).toHaveProperty('id')
      expect(sponsor).toHaveProperty('organization')
      expect(sponsor).toHaveProperty('sponsorLevel')
      expect(sponsor).toHaveProperty('description')
      expect(sponsor).toHaveProperty('website')
      expect(sponsor).toHaveProperty('sponsorImgUrl')
      
      expect(typeof sponsor.id).toBe('number')
      expect(typeof sponsor.organization).toBe('string')
      expect(['Diamond', 'Platinum', 'Gold', 'Silver']).toContain(sponsor.sponsorLevel)
      expect(typeof sponsor.description).toBe('string')
      expect(typeof sponsor.website).toBe('string')
      expect(sponsor.sponsorImgUrl).toBeNull()
    })
  })
}) 