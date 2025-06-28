/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { sponsors } from '@/lib/schema'
import {
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse,
} from '@/test-utils/test-utils.helper'
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

describe('/api/sponsors/[sponsorId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  const mockEq = eq as jest.MockedFunction<typeof eq>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should delete a sponsor successfully with image', async () => {
      const sponsorId = '1'
      const mockSponsor = createMockSponsor({ 
        id: 1, 
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-image.jpg' 
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
      validateApiResponse(response, 200)
      validateSuccessResponse(data, 1)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.delete).toHaveBeenCalledWith(sponsors)
    })

    it('should delete a sponsor successfully without image', async () => {
      const sponsorId = '2'
      const mockSponsor = createMockSponsor({ 
        id: 2, 
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
      validateApiResponse(response, 200)
      validateSuccessResponse(data, 2)
    })

    it('should handle missing sponsor ID', async () => {
      const sponsorId = ''

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing sponsor ID')
    })

    it('should handle invalid sponsor ID', async () => {
      const sponsorId = 'invalid'

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/invalid', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing sponsor ID')
    })

    it('should handle database errors during select', async () => {
      const sponsorId = '1'

      // Mock database error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(new Error('Database connection failed'))
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
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle S3 deletion errors', async () => {
      const sponsorId = '1'
      const mockSponsor = createMockSponsor({ 
        id: 1, 
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-image.jpg' 
      })

      // Mock database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSponsor])
        })
      } as any)

      // Mock database delete error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Delete operation failed'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Delete operation failed')
    })

    it('should handle database errors during delete', async () => {
      const sponsorId = '1'
      const mockSponsor = createMockSponsor({ id: 1 })

      // Mock database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSponsor])
        })
      } as any)

      // Mock database delete error
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Delete operation failed'))
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/1', {
        method: 'DELETE',
      })

      // Call the API
      const response = await DELETE(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Delete operation failed')
    })
  })

  describe('PUT', () => {
    it('should update a sponsor successfully with new image', async () => {
      const sponsorId = '1'
      const mockFile = createMockFile('new-sponsor.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('organization', 'Updated Organization')
      formData.append('sponsorLevel', 'Platinum')
      formData.append('description', 'Updated description')
      formData.append('website', 'https://updated-organization.com')
      formData.append('media', mockFile)

      const existingSponsor = createMockSponsor({ 
        id: 1, 
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-image.jpg' 
      })
      const updatedSponsor = createMockSponsor({
        id: 1,
        organization: 'Updated Organization',
        sponsorLevel: 'Platinum',
        description: 'Updated description',
        website: 'https://updated-organization.com',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsors/test-uuid-123-new-sponsor.jpg',
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
      validateApiResponse(response, 200)
      validateSuccessResponse(data, updatedSponsor)
      expect(mockDb.update).toHaveBeenCalledWith(sponsors)
    })

    it('should update a sponsor successfully without new image', async () => {
      const sponsorId = '2'
      const formData = new FormData()
      formData.append('organization', 'Updated Organization No Image')
      formData.append('sponsorLevel', 'Silver')
      formData.append('description', 'Updated description no image')
      formData.append('website', 'https://updated-organization-no-image.com')

      const updatedSponsor = createMockSponsor({
        id: 2,
        organization: 'Updated Organization No Image',
        sponsorLevel: 'Silver',
        description: 'Updated description no image',
        website: 'https://updated-organization-no-image.com',
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
      validateApiResponse(response, 200)
      validateSuccessResponse(data, updatedSponsor)
      expect(mockDb.update).toHaveBeenCalledWith(sponsors)
    })

    it('should handle missing sponsor ID', async () => {
      const sponsorId = ''
      const formData = new FormData()

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing sponsor ID')
    })

    it('should handle invalid sponsor ID', async () => {
      const sponsorId = 'invalid'
      const formData = new FormData()

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors/invalid', {
        method: 'PUT',
        body: formData,
      })

      // Call the API
      const response = await PUT(request, { params: Promise.resolve({ sponsorId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing sponsor ID')
    })

    it('should handle S3 upload errors', async () => {
      const sponsorId = '1'
      const mockFile = createMockFile('new-sponsor.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('organization', 'Updated Organization')
      formData.append('sponsorLevel', 'Gold')
      formData.append('description', 'Updated description')
      formData.append('website', 'https://updated-organization.com')
      formData.append('media', mockFile)

      const existingSponsor = createMockSponsor({ 
        id: 1, 
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/old-image.jpg' 
      })

      // Mock database select for existing sponsor
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingSponsor])
        })
      } as any)

      // Mock database update error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error('Update operation failed'))
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
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Update operation failed')
    })

    it('should handle database errors during update', async () => {
      const sponsorId = '1'
      const formData = new FormData()
      formData.append('organization', 'Updated Organization')
      formData.append('sponsorLevel', 'Gold')
      formData.append('description', 'Updated description')
      formData.append('website', 'https://updated-organization.com')

      // Mock database update error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error('Update operation failed'))
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
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Update operation failed')
    })

    it('should handle unknown errors', async () => {
      const sponsorId = '1'
      const formData = new FormData()

      // Mock unknown error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue('Unknown error')
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
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Unknown error')
    })

    it('should handle form data with null values', async () => {
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
      validateApiResponse(response, 200)
      validateSuccessResponse(data, updatedSponsor)
    })
  })
}) 