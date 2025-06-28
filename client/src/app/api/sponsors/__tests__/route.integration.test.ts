/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
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

describe('/api/sponsors Integration Tests', () => {
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.body)).toBe(true)
      expect(data.body).toHaveLength(3)
      
      // Validate sponsor structure
      const sponsor = data.body[0]
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
      expect(typeof sponsor.sponsorImgUrl).toBe('string')
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveLength(0)
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
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST', () => {
    it('should create a new sponsor with image upload', async () => {
      // Mock form data
      const mockFile = createMockFile('test-sponsor.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('organization', 'Integration Test Gold Sponsor')
      formData.append('sponsorLevel', 'Gold')
      formData.append('description', 'Integration test gold level sponsor')
      formData.append('website', 'https://integration-test-gold-sponsor.com')
      formData.append('media', mockFile)

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 1,
        organization: 'Integration Test Gold Sponsor',
        sponsorLevel: 'Gold',
        description: 'Integration test gold level sponsor',
        website: 'https://integration-test-gold-sponsor.com',
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id')
      expect(data.body.organization).toBe('Integration Test Gold Sponsor')
      expect(data.body.sponsorLevel).toBe('Gold')
      expect(data.body.description).toBe('Integration test gold level sponsor')
      expect(data.body.website).toBe('https://integration-test-gold-sponsor.com')
      expect(data.body.sponsorImgUrl).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/')
    })

    it('should create a new sponsor without image upload', async () => {
      // Mock form data without image
      const formData = new FormData()
      formData.append('organization', 'Integration Test Silver Sponsor')
      formData.append('sponsorLevel', 'Silver')
      formData.append('description', 'Integration test silver level sponsor')
      formData.append('website', 'https://integration-test-silver-sponsor.com')

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 2,
        organization: 'Integration Test Silver Sponsor',
        sponsorLevel: 'Silver',
        description: 'Integration test silver level sponsor',
        website: 'https://integration-test-silver-sponsor.com',
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id')
      expect(data.body.organization).toBe('Integration Test Silver Sponsor')
      expect(data.body.sponsorLevel).toBe('Silver')
      expect(data.body.description).toBe('Integration test silver level sponsor')
      expect(data.body.website).toBe('https://integration-test-silver-sponsor.com')
      expect(data.body.sponsorImgUrl).toBe('')
    })

    it('should handle all sponsor levels correctly', async () => {
      const sponsorLevels = ['Diamond', 'Platinum', 'Gold', 'Silver'] as const
      
      for (const level of sponsorLevels) {
        // Mock form data
        const formData = new FormData()
        formData.append('organization', `Integration Test ${level} Sponsor`)
        formData.append('sponsorLevel', level)
        formData.append('description', `Integration test ${level.toLowerCase()} level sponsor`)
        formData.append('website', `https://integration-test-${level.toLowerCase()}-sponsor.com`)

        // Mock the database insert
        const mockInsertedSponsor = createMockSponsor({
          id: 3,
          organization: `Integration Test ${level} Sponsor`,
          sponsorLevel: level,
          description: `Integration test ${level.toLowerCase()} level sponsor`,
          website: `https://integration-test-${level.toLowerCase()}-sponsor.com`,
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
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.body.sponsorLevel).toBe(level)
        expect(data.body.organization).toBe(`Integration Test ${level} Sponsor`)
      }
    })

    it('should handle missing optional fields gracefully', async () => {
      // Mock form data with minimal fields
      const formData = new FormData()
      formData.append('organization', 'Integration Test Minimal Sponsor')
      formData.append('sponsorLevel', 'Gold')

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 4,
        organization: 'Integration Test Minimal Sponsor',
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.organization).toBe('Integration Test Minimal Sponsor')
      expect(data.body.sponsorLevel).toBe('Gold')
      expect(data.body.description).toBe('')
      expect(data.body.website).toBe('')
      expect(data.body.sponsorImgUrl).toBe('')
    })

    it('should handle database insertion errors', async () => {
      // Mock form data
      const formData = new FormData()
      formData.append('organization', 'Integration Test Error Sponsor')
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
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database insertion failed')
    })

    it('should handle malformed request body', async () => {
      // Create request with invalid body
      const request = new NextRequest('http://localhost:3000/api/sponsors', {
        method: 'POST',
        body: 'invalid json body',
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(500)
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.organization).toBe('')
      expect(data.body.sponsorLevel).toBeUndefined()
      expect(data.body.description).toBe('')
      expect(data.body.website).toBe('')
      expect(data.body.sponsorImgUrl).toBe('')
    })
  })

  describe('Error Handling', () => {
    it('should handle concurrent requests', async () => {
      // Mock sponsor data
      const mockSponsors = [
        createMockSponsor({ id: 1, organization: 'Concurrent Test Sponsor 1' }),
        createMockSponsor({ id: 2, organization: 'Concurrent Test Sponsor 2' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockSponsors)
      } as any)

      // Make concurrent requests
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
        expect(data.success).toBe(true)
        expect(Array.isArray(data.body)).toBe(true)
        expect(data.body).toHaveLength(2)
      })
    })

    it('should handle large file uploads', async () => {
      // Create a large mock file
      const largeContent = 'x'.repeat(1024 * 1024) // 1MB
      const mockFile = createMockFile('large-sponsor.jpg', 'image/jpeg', largeContent)
      const formData = new FormData()
      formData.append('organization', 'Large File Sponsor')
      formData.append('sponsorLevel', 'Gold')
      formData.append('media', mockFile)

      // Mock the database insert
      const mockInsertedSponsor = createMockSponsor({
        id: 6,
        organization: 'Large File Sponsor',
        sponsorLevel: 'Gold',
        sponsorImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/sponsor/test-uuid-123-large-sponsor.jpg',
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
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.organization).toBe('Large File Sponsor')
      expect(data.body.sponsorImgUrl).toContain('large-sponsor.jpg')
    })
  })
}) 