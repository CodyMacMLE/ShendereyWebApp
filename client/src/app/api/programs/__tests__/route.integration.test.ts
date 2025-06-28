/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { programs } from '@/lib/schema'
import { ilike } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock AWS S3 for integration tests
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

// Helper function to clean up test data
const cleanupTestData = async () => {
  try {
    await db.delete(programs).where(ilike(programs.name, 'Test Program%'))
  } catch (error) {
    console.warn('Cleanup failed:', error)
  }
}

describe('/api/programs Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('GET', () => {
    it('should return all programs from the database', async () => {
      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.body)).toBe(true)
      
      // If there are programs, validate their structure
      if (data.body.length > 0) {
        const program = data.body[0]
        expect(program).toHaveProperty('id')
        expect(program).toHaveProperty('name')
        expect(program).toHaveProperty('category')
        expect(program).toHaveProperty('description')
        expect(program).toHaveProperty('length')
        expect(program).toHaveProperty('ages')
        expect(program).toHaveProperty('programImgUrl')
        
        expect(typeof program.id).toBe('number')
        expect(typeof program.name).toBe('string')
        expect(['competitive', 'recreational']).toContain(program.category)
        expect(typeof program.description).toBe('string')
        expect(typeof program.length).toBe('number')
        expect(typeof program.ages).toBe('string')
        expect(typeof program.programImgUrl).toBe('string')
      }
    })
  })

  describe('POST', () => {
    it('should create a new competitive program with image upload', async () => {
      // Mock form data
      const mockFile = createMockFile('test-competitive-program.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('name', 'Test Program Competitive')
      formData.append('category', 'competitive')
      formData.append('ages', '8-14')
      formData.append('length', '16')
      formData.append('description', 'Integration test competitive program')
      formData.append('programImgFile', mockFile)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      expect(data.body.name).toBe('Test Program Competitive')
      expect(data.body.category).toBe('competitive')
      expect(data.body.ages).toBe('8-14')
      expect(data.body.length).toBe(16)
      expect(data.body.description).toBe('Integration test competitive program')
      expect(data.body.programImgUrl).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/program/')
    })

    it('should create a new recreational program without image upload', async () => {
      // Mock form data without image
      const formData = new FormData()
      formData.append('name', 'Test Program Recreational')
      formData.append('category', 'recreational')
      formData.append('ages', '4-6')
      formData.append('length', '8')
      formData.append('description', 'Integration test recreational program')

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      expect(data.body.name).toBe('Test Program Recreational')
      expect(data.body.category).toBe('recreational')
      expect(data.body.ages).toBe('4-6')
      expect(data.body.length).toBe(8)
      expect(data.body.description).toBe('Integration test recreational program')
      expect(data.body.programImgUrl).toBe('')
    })

    it('should handle missing optional fields gracefully', async () => {
      // Mock form data with minimal required fields
      const formData = new FormData()
      formData.append('name', 'Test Program Minimal')
      formData.append('category', 'competitive')
      // Missing ages, length, description

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      expect(data.body.name).toBe('Test Program Minimal')
      expect(data.body.category).toBe('competitive')
      expect(data.body.ages).toBe('')
      expect(data.body.length).toBe(0)
      expect(data.body.description).toBe('')
      expect(data.body.programImgUrl).toBe('')
    })

    it('should handle invalid length value by defaulting to 0', async () => {
      // Mock form data with invalid length
      const formData = new FormData()
      formData.append('name', 'Test Program Invalid Length')
      formData.append('category', 'recreational')
      formData.append('ages', '6-12')
      formData.append('length', 'not-a-number')
      formData.append('description', 'Test with invalid length')

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      expect(data.body.name).toBe('Test Program Invalid Length')
      expect(data.body.length).toBe(0) // Should default to 0
    })

    it('should verify the created program exists in the database', async () => {
      // First, create a program
      const formData = new FormData()
      formData.append('name', 'Test Program Verification')
      formData.append('category', 'competitive')
      formData.append('ages', '10-16')
      formData.append('length', '20')
      formData.append('description', 'Program to verify database persistence')

      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      const createdProgramId = data.body.id

      // Now verify it exists by fetching all programs
      const getResponse = await GET()
      const getData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(getData.success).toBe(true)
      
      const foundProgram = getData.body.find((p: any) => p.id === createdProgramId)
      expect(foundProgram).toBeDefined()
      expect(foundProgram.name).toBe('Test Program Verification')
      expect(foundProgram.category).toBe('competitive')
      expect(foundProgram.ages).toBe('10-16')
      expect(foundProgram.length).toBe(20)
      expect(foundProgram.description).toBe('Program to verify database persistence')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed request body', async () => {
      // Create request with invalid body
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
      expect(data.body.name).toBe('')
      expect(data.body.category).toBeUndefined()
      expect(data.body.ages).toBe('')
      expect(data.body.length).toBe(0)
      expect(data.body.description).toBe('')
      expect(data.body.programImgUrl).toBe('')
    })
  })
}) 