/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { programs } from '@/lib/schema'
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
let _mockS3Send: jest.Mock = jest.fn();
export const setMockS3Send = (impl: any) => {
  _mockS3Send = impl;
};
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: (...args: any[]) => _mockS3Send(...args) })),
  PutObjectCommand: jest.fn(),
}));

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

// Helper function to create mock program data
export const createMockProgram = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'Test Program',
  category: 'competitive' as const,
  description: 'Test program description',
  length: 12,
  ages: '6-12',
  programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-uuid-123-test.jpg',
  ...overrides,
})

// Helper function to create mock file
const createMockFile = (name: string, type: string, content: string = 'test-content'): File => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

// Helper function to validate program data structure
export const validateProgramDataStructure = (program: any) => {
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

describe('/api/programs', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
    if (_mockS3Send) _mockS3Send.mockResolvedValue({}) // Default success response
  })

  describe('GET', () => {
    it('should return all programs successfully', async () => {
      // Mock data
      const mockPrograms = [
        createMockProgram({ id: 1, name: 'Competitive Program' }),
        createMockProgram({ id: 2, name: 'Recreational Program', category: 'recreational' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockPrograms)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockPrograms)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should return empty array when no programs exist', async () => {
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
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValue({
        from: jest.fn().mockRejectedValue(mockError)
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
    it('should create a new program successfully with image upload', async () => {
      // Mock form data
      const mockFile = createMockFile('test-program.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('name', 'New Competitive Program')
      formData.append('category', 'competitive')
      formData.append('ages', '8-14')
      formData.append('length', '16')
      formData.append('description', 'A new competitive program for advanced athletes')
      formData.append('programImgFile', mockFile)

      // Mock the database insert
      const mockInsertedProgram = createMockProgram({
        id: 3,
        name: 'New Competitive Program',
        length: 16,
        ages: '8-14',
        description: 'A new competitive program for advanced athletes',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedProgram])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedProgram)
      expect(mockDb.insert).toHaveBeenCalledWith(programs)
    })

    it('should create a new program successfully without image upload', async () => {
      // Mock form data without image
      const formData = new FormData()
      formData.append('name', 'New Recreational Program')
      formData.append('category', 'recreational')
      formData.append('ages', '4-6')
      formData.append('length', '8')
      formData.append('description', 'A new recreational program for beginners')

      // Mock the database insert
      const mockInsertedProgram = createMockProgram({
        id: 4,
        name: 'New Recreational Program',
        category: 'recreational',
        length: 8,
        ages: '4-6',
        description: 'A new recreational program for beginners',
        programImgUrl: '',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedProgram])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedProgram)
    })

    it('should handle missing required fields gracefully', async () => {
      // Mock form data with missing fields
      const formData = new FormData()
      formData.append('name', 'Test Program')
      // Missing category, ages, length, description

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Mock the database insert
      const mockInsertedProgram = createMockProgram({
        id: 5,
        name: 'Test Program',
        category: undefined,
        length: 0,
        ages: '',
        description: '',
        programImgUrl: '',
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedProgram])
        })
      } as any)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedProgram)
    })

    it('should handle invalid length value gracefully', async () => {
      // Mock form data with invalid length
      const formData = new FormData()
      formData.append('name', 'Test Program')
      formData.append('category', 'competitive')
      formData.append('ages', '6-12')
      formData.append('length', 'invalid')
      formData.append('description', 'Test description')

      // Mock the database insert
      const mockInsertedProgram = createMockProgram({
        id: 6,
        name: 'Test Program',
        length: 0, // Should default to 0 for invalid length
      })
      
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedProgram])
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockInsertedProgram)
    })

    it('should handle database errors during program creation', async () => {
      // Mock form data
      const formData = new FormData()
      formData.append('name', 'Test Program')
      formData.append('category', 'competitive')
      formData.append('ages', '6-12')
      formData.append('length', '12')
      formData.append('description', 'Test description')

      // Mock database error
      const mockError = new Error('Database insert failed')
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError)
        })
      } as any)

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database insert failed')
    })

    it('should handle S3 upload errors gracefully', async () => {
      // Mock form data with file
      const mockFile = createMockFile('test-program.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('name', 'Test Program')
      formData.append('category', 'competitive')
      formData.append('ages', '6-12')
      formData.append('length', '12')
      formData.append('description', 'Test description')
      formData.append('programImgFile', mockFile)

      // Mock S3 error
      _mockS3Send.mockRejectedValue(new Error('S3 upload failed'))

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: formData,
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 upload failed')
    })

    it('should handle form data parsing errors', async () => {
      // Create invalid request (not FormData)
      const request = new NextRequest('http://localhost:3000/api/programs', {
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
  })
}) 