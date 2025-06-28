/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import {
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse,
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
let _mockS3Send: jest.Mock = jest.fn();
export const setMockS3Send = (impl: any) => {
  _mockS3Send = impl;
};
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: (...args: any[]) => _mockS3Send(...args) })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
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

describe('/api/programs/[programId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
    if (_mockS3Send) _mockS3Send.mockResolvedValue({}) // Default success response
  })

  describe('GET', () => {
    it('should return a program successfully', async () => {
      const mockProgram = createMockProgram({ id: 1, name: 'Competitive Program' })

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram])
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/1')
      const params = Promise.resolve({ programId: '1' })

      const response = await GET(request, { params })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockProgram)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should return 400 for missing program ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/programs/')
      const params = Promise.resolve({ programId: '' })

      const response = await GET(request, { params })
      const data = await response.json()

      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing program ID')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/1')
      const params = Promise.resolve({ programId: '1' })

      const response = await GET(request, { params })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })
  })

  describe('PUT', () => {
    it('should update a program successfully with new image upload', async () => {
      const existingProgram = createMockProgram({ 
        id: 1, 
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/old-image.jpg' 
      })

      const mockFile = createMockFile('new-program.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('name', 'Updated Competitive Program')
      formData.append('category', 'competitive')
      formData.append('ages', '8-14')
      formData.append('length', '16')
      formData.append('description', 'Updated program description')
      formData.append('programImgFile', mockFile)

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingProgram])
        })
      } as any)

      const updatedProgram = createMockProgram({
        id: 1,
        name: 'Updated Competitive Program',
        length: 16,
        ages: '8-14',
        description: 'Updated program description',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-uuid-123-new-program.jpg'
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedProgram])
          })
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data, updatedProgram)
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should return 400 for missing program ID', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Program')
      formData.append('category', 'competitive')

      const request = new NextRequest('http://localhost:3000/api/programs/', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: '' })

      const response = await PUT(request, { params })
      const data = await response.json()

      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing program ID')
    })
  })

  describe('DELETE', () => {
    it('should delete a program successfully with associated groups and S3 cleanup', async () => {
      const mockProgram = createMockProgram({ 
        id: 1, 
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-image.jpg' 
      })

      const mockGroups = [
        { id: 1, program: 1 },
        { id: 2, program: 1 }
      ]

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockGroups)
        })
      } as any)

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram])
        })
      } as any)

      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({})
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: '1' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(mockDb.delete).toHaveBeenCalledTimes(3)
    })

    it('should return 400 for missing program ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/programs/', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: '' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing program ID')
    })
  })
}) 