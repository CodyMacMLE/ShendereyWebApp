/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { DELETE, GET, PUT } from '../route'

// Mock the database module for integration tests
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    insert: jest.fn(),
  },
}))

// Mock AWS S3 for integration tests
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

// Helper function to create mock program data
const createMockProgram = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'Test Program',
  category: 'competitive' as const,
  description: 'Test program description',
  length: 12,
  ages: '6-12',
  programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-uuid-123-test.jpg',
  ...overrides,
})

describe('/api/programs/[programId] Integration Tests', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return a specific program from the database', async () => {
      // Mock program data
      const mockProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program GET',
        description: 'Test program for GET integration test'
      })

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram])
        })
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1')
      const params = Promise.resolve({ programId: '1' })
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 1)
      expect(data.body.name).toBe('Test Program GET')
      expect(data.body.category).toBe('competitive')
      expect(data.body.description).toBe('Test program for GET integration test')
      expect(data.body.length).toBe(12)
      expect(data.body.ages).toBe('6-12')
    })

    it('should return 400 for invalid program ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/programs/invalid')
      const params = Promise.resolve({ programId: 'invalid' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing program ID')
    })

    it('should return 200 with undefined body for non-existent program', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/99999')
      const params = Promise.resolve({ programId: '99999' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toBeUndefined()
    })
  })

  describe('PUT', () => {
    it('should update a program successfully with new image upload', async () => {
      // Mock existing program
      const existingProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program PUT',
        category: 'recreational',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/old-image.jpg'
      })

      // Mock form data with image
      const mockFile = createMockFile('updated-program.jpg', 'image/jpeg')
      const formData = new FormData()
      formData.append('name', 'Updated Test Program')
      formData.append('category', 'competitive')
      formData.append('ages', '8-14')
      formData.append('length', '16')
      formData.append('description', 'Updated description with image')
      formData.append('programImgFile', mockFile)

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingProgram])
        })
      } as any)

      const updatedProgram = createMockProgram({
        id: 1,
        name: 'Updated Test Program',
        category: 'competitive',
        length: 16,
        ages: '8-14',
        description: 'Updated description with image',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-uuid-123-updated-program.jpg'
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedProgram])
          })
        })
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 1)
      expect(data.body.name).toBe('Updated Test Program')
      expect(data.body.category).toBe('competitive')
      expect(data.body.ages).toBe('8-14')
      expect(data.body.length).toBe(16)
      expect(data.body.description).toBe('Updated description with image')
      expect(data.body.programImgUrl).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/program/')
    })

    it('should update a program successfully without image upload', async () => {
      // Mock existing program
      const existingProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program PUT No Image',
        category: 'competitive',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/existing-image.jpg'
      })

      // Mock form data without image
      const formData = new FormData()
      formData.append('name', 'Updated Test Program No Image')
      formData.append('category', 'recreational')
      formData.append('ages', '4-6')
      formData.append('length', '8')
      formData.append('description', 'Updated description without image')

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingProgram])
        })
      } as any)

      const updatedProgram = createMockProgram({
        id: 1,
        name: 'Updated Test Program No Image',
        category: 'recreational',
        length: 8,
        ages: '4-6',
        description: 'Updated description without image',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/existing-image.jpg'
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedProgram])
          })
        })
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 1)
      expect(data.body.name).toBe('Updated Test Program No Image')
      expect(data.body.category).toBe('recreational')
      expect(data.body.ages).toBe('4-6')
      expect(data.body.length).toBe(8)
      expect(data.body.description).toBe('Updated description without image')
      expect(data.body.programImgUrl).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/program/existing-image.jpg')
    })

    it('should return 400 for invalid program ID', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Program')
      formData.append('category', 'competitive')

      const request = new NextRequest('http://localhost:3000/api/programs/invalid', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: 'invalid' })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing program ID')
    })

    it('should handle missing optional fields gracefully', async () => {
      // Mock existing program
      const existingProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program PUT Minimal',
        category: 'competitive'
      })

      // Mock form data with minimal fields
      const formData = new FormData()
      formData.append('name', 'Updated Minimal Program')
      formData.append('category', 'recreational')
      // Missing ages, length, description

      // Mock the database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingProgram])
        })
      } as any)

      const updatedProgram = createMockProgram({
        id: 1,
        name: 'Updated Minimal Program',
        category: 'recreational',
        ages: '',
        length: 0,
        description: '',
        programImgUrl: ''
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedProgram])
          })
        })
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'PUT',
        body: formData,
      })
      const params = Promise.resolve({ programId: '1' })
      const response = await PUT(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body).toHaveProperty('id', 1)
      expect(data.body.name).toBe('Updated Minimal Program')
      expect(data.body.category).toBe('recreational')
      expect(data.body.ages).toBe('')
      expect(data.body.length).toBe(0)
      expect(data.body.description).toBe('')
    })
  })

  describe('DELETE', () => {
    it('should delete a program successfully without associated groups', async () => {
      // Mock program data
      const mockProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program DELETE',
        description: 'Test program for DELETE integration test',
        programImgUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/program/test-image.jpg'
      })

      // Mock empty groups result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      // Mock program select for S3 cleanup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram])
        })
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({})
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // The route always calls delete 3 times: coachGroupLines, groups, programs
      // Even when there are no groups, it still tries to delete coachGroupLines and groups
      expect(mockDb.delete).toHaveBeenCalledTimes(3)
    })

    it('should delete a program successfully with associated groups', async () => {
      // Mock program data
      const mockProgram = createMockProgram({ 
        id: 1, 
        name: 'Test Program DELETE With Groups',
        description: 'Test program with groups for DELETE integration test'
      })

      // Mock groups data
      const mockGroups = [
        { id: 1, program: 1 },
        { id: 2, program: 1 }
      ]

      // Mock database queries
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockGroups)
        })
      } as any)

      // Mock program select for S3 cleanup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram])
        })
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({})
      } as any)

      // Call the API
      const request = new NextRequest('http://localhost:3000/api/programs/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockDb.delete).toHaveBeenCalledTimes(3) // coachGroupLines, groups, programs
    })

    it('should return 400 for invalid program ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/programs/invalid', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: 'invalid' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing program ID')
    })

    it('should handle deletion of non-existent program gracefully', async () => {
      // Mock empty groups result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      // Mock empty program result
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      } as any)

      // Mock delete operations
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue({})
      } as any)

      const request = new NextRequest('http://localhost:3000/api/programs/99999', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ programId: '99999' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
}) 