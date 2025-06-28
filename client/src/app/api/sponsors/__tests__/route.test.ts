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
  randomUUID: jest.fn().mockReturnValue('test-uuid-123'),
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

describe('/api/sponsors', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all sponsors from the database', async () => {
      // Mock sponsor data
      const mockSponsors = [
        createMockSponsor({ id: 1, organization: 'Gold Sponsor' }),
        createMockSponsor({ id: 2, organization: 'Silver Sponsor', sponsorLevel: 'Silver' }),
        createMockSponsor({ id: 3, organization: 'Platinum Sponsor', sponsorLevel: 'Platinum' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockSponsors)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockSponsors)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.select().from).toHaveBeenCalledWith(sponsors)
    })

    it('should return empty array when no sponsors exist', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([])
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
      expect(data.body).toHaveLength(0)
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
      validateErrorResponse(data, 'Database connection failed')
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
      validateErrorResponse(data, 'Unknown error')
    })
  })

  describe('POST', () => {
    it('should create a new sponsor successfully with image upload', async () => {
      // Mock form data
      const mockFile = createMockFile('test-sponsor.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('organization', 'New Gold Sponsor')
      formData.append('sponsorLevel', 'Gold')
      formData.append('description', 'A new gold level sponsor')
      formData.append('website', 'https://new-gold-sponsor.com')
      formData.append('media', mockFile)

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 1,
        organization: 'New Gold Sponsor',
        sponsorLevel: 'Gold',
        description: 'A new gold level sponsor',
        website: 'https://new-gold-sponsor.com',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/test-uuid-123-test-sponsor.jpg',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedSponsor])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedSponsor)
      expect(mockDb.insert).toHaveBeenCalledWith(sponsors)
    })

    it('should create a new sponsor without image upload', async () => {
      // Mock form data without image
      const formData = new FormData()
      formData.append('organization', 'Silver Sponsor No Image')
      formData.append('sponsorLevel', 'Silver')
      formData.append('description', 'A silver sponsor without image')
      formData.append('website', 'https://silver-sponsor-no-image.com')

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 2,
        organization: 'Silver Sponsor No Image',
        sponsorLevel: 'Silver',
        description: 'A silver sponsor without image',
        website: 'https://silver-sponsor-no-image.com',
        sponsorImgUrl: '',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedSponsor])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedSponsor)
    })

    it('should handle all sponsor levels correctly', async () => {
      const sponsorLevels = ['Diamond', 'Platinum', 'Gold', 'Silver'] as const
      
      for (const level of sponsorLevels) {
        // Mock form data
        const formData = new FormData()
        formData.append('organization', `${level} Level Sponsor`)
        formData.append('sponsorLevel', level)
        formData.append('description', `A ${level.toLowerCase()} level sponsor`)
        formData.append('website', `https://${level.toLowerCase()}-sponsor.com`)

        // Mock the database insert
        const mockInsertedSponsor = createMockSponsor({
          id: 3,
          organization: `${level} Level Sponsor`,
          sponsorLevel: level,
          description: `A ${level.toLowerCase()} level sponsor`,
          website: `https://${level.toLowerCase()}-sponsor.com`,
          sponsorImgUrl: '',
        })
        
        mockDb.insert.mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockInsertedSponsor])
          })
        } as any)

        // Create mock request
        const request = new NextRequest('http://localhost:3000/api/sponsors', {
          method: 'POST',
          body: formData,
        })

        // Call the API
        const response = await POST(request)
        const data = await response.json()

        // Assertions
        validateApiResponse(response, 200)
        validateSuccessResponse(data, mockInsertedSponsor)
        expect(data.body.sponsorLevel).toBe(level)
      }
    })

    it('should handle missing optional fields gracefully', async () => {
      // Mock form data with minimal fields
      const formData = new FormData()
      formData.append('organization', 'Minimal Sponsor')
      formData.append('sponsorLevel', 'Gold')

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 4,
        organization: 'Minimal Sponsor',
        sponsorLevel: 'Gold',
        description: '',
        website: '',
        sponsorImgUrl: '',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedSponsor])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedSponsor)
      expect(data.body.description).toBe('')
      expect(data.body.website).toBe('')
      expect(data.body.sponsorImgUrl).toBe('')
    })

    it('should handle database insertion errors', async () => {
      // Mock form data
      const formData = new FormData()
      formData.append('organization', 'Error Sponsor')
      formData.append('sponsorLevel', 'Gold')

      // Mock database error
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database insertion failed'))
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database insertion failed')
    })

    it('should handle S3 upload errors', async () => {
      // Clear module cache to ensure fresh S3Client instance
      jest.resetModules()
      
      // Mock S3 error - this should happen before database insertion
      const { S3Client } = require('@aws-sdk/client-s3')
      const mockSend = jest.fn().mockRejectedValue(new Error('S3 upload failed'))
      S3Client.mockImplementation(() => ({
        send: mockSend
      }))

      // Re-import the route to get fresh S3Client instance
      const { POST: POSTWithFreshS3 } = require('../route')

      // Mock form data with image
      const mockFile = createMockFile('test-sponsor.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('organization', 'S3 Error Sponsor')
      formData.append('sponsorLevel', 'Gold')
      formData.append('media', mockFile)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POSTWithFreshS3(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 upload failed')
      
      // Verify that database insert was not called since S3 upload failed first
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it('should handle form data parsing errors', async () => {
      // Create invalid request (not FormData)
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: 'invalid body',
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle empty form data', async () => {
      // Create request with empty form data
      const formData = new FormData()
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: formData,
      })

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 5,
        organization: '',
        sponsorLevel: undefined,
        description: '',
        website: '',
        sponsorImgUrl: '',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedSponsor])
        })
      } as any)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedSponsor)
      expect(data.body.organization).toBe('')
      expect(data.body.sponsorLevel).toBeUndefined()
      expect(data.body.description).toBe('')
      expect(data.body.website).toBe('')
      expect(data.body.sponsorImgUrl).toBe('')
    })
  })
}) 