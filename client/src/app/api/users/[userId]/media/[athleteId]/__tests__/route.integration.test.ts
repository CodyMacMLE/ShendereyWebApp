/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { media } from '@/lib/schema'
import { validateApiResponse, validateErrorResponse, validateSuccessResponse } from '@/test-utils/test-utils.helper'
import { NextRequest } from 'next/server'
import { DELETE, GET, POST, PUT } from '../route'

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
  randomUUID: jest.fn().mockReturnValue('test-uuid'),
}))

// Mock tmp-promise
jest.mock('tmp-promise', () => ({
  file: jest.fn().mockResolvedValue({
    path: '/tmp/test-file.jpg',
    cleanup: jest.fn().mockResolvedValue(undefined),
  }),
}))

// Mock fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('test-image-data')),
}))

// Mock fluent-ffmpeg
jest.mock('fluent-ffmpeg', () => {
  const mockFfmpeg = jest.fn().mockImplementation(() => ({
    on: jest.fn().mockReturnThis(),
    screenshots: jest.fn().mockReturnThis(),
  })) as any
  
  mockFfmpeg.ffprobe = jest.fn().mockImplementation((path, callback) => {
    callback(null, {
      streams: [{ width: 1920, height: 1080 }]
    })
  })
  
  mockFfmpeg.setFfmpegPath = jest.fn()
  
  return mockFfmpeg
})

describe('/api/users/[userId]/media/[athleteId] - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_BUCKET_NAME = 'test-bucket'
  })

  describe('POST - Integration', () => {
    const createMockFormData = (overrides: any = {}) => {
      const formData = new FormData()
      formData.append('mediaType', overrides.mediaType || 'image/jpeg')
      formData.append('name', overrides.name || 'Test Media')
      formData.append('description', overrides.description || 'Test Description')
      formData.append('category', overrides.category || 'competition')
      formData.append('date', overrides.date || '2024-01-01')
      
      if (overrides.media) {
        formData.append('media', overrides.media)
      }
      
      return formData
    }

    const createMockFile = (name: string, type: string, size: number = 1024) => {
      const file = new File(['test content'], name, { type })
      Object.defineProperty(file, 'size', { value: size })
      return file
    }

    it('should create media and return updated list', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg')
      const formData = createMockFormData({ media: mockFile })
      
      // Mock database insert
      const mockInsertSpy = jest.spyOn(db, 'insert').mockReturnValue({
        values: jest.fn().mockResolvedValue([{ id: 1 }]),
      } as any)
      
      // Mock database select for fetching updated list
      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: 1,
              athlete: 1,
              name: 'Test Media',
              description: 'Test Description',
              category: 'competition',
              date: new Date('2024-01-01'),
              mediaType: 'image/jpeg',
              mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/athlete/media/test-uuid-test.jpg',
              videoThumbnail: ''
            }
          ]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request, {
        params: Promise.resolve({ userId: '1', athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toHaveLength(1)
      expect(data.body[0].name).toBe('Test Media')
      expect(data.body[0].mediaUrl).toContain('test-uuid-test.jpg')
      
      expect(mockInsertSpy).toHaveBeenCalledWith(media)
      expect(mockSelectSpy).toHaveBeenCalled()
    })

    it('should handle video upload with thumbnail generation', async () => {
      const mockFile = createMockFile('test.mp4', 'video/mp4')
      const formData = createMockFormData({ 
        media: mockFile,
        mediaType: 'video/mp4'
      })
      
      const mockInsertSpy = jest.spyOn(db, 'insert').mockReturnValue({
        values: jest.fn().mockResolvedValue([{ id: 1 }]),
      } as any)
      
      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: 1,
              athlete: 1,
              name: 'Test Media',
              description: 'Test Description',
              category: 'competition',
              date: new Date('2024-01-01'),
              mediaType: 'video/mp4',
              mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/athlete/media/test-uuid-test.mp4',
              videoThumbnail: 'https://test-bucket.s3.us-east-1.amazonaws.com/athlete/media/thumbnails/test-uuid.jpg'
            }
          ]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request, {
        params: Promise.resolve({ userId: '1', athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body[0].mediaType).toBe('video/mp4')
      expect(data.body[0].videoThumbnail).toContain('thumbnails/test-uuid.jpg')
      
      expect(mockInsertSpy).toHaveBeenCalledWith(media)
      expect(mockSelectSpy).toHaveBeenCalled()
    })
  })

  describe('GET - Integration', () => {
    it('should fetch media for specific athlete', async () => {
      const mockMedia = [
        {
          id: 1,
          athlete: 1,
          name: 'Test Media 1',
          description: 'Test Description 1',
          category: 'competition',
          date: new Date('2024-01-01'),
          mediaType: 'image/jpeg',
          mediaUrl: 'https://example.com/media1.jpg',
          videoThumbnail: ''
        },
        {
          id: 2,
          athlete: 1,
          name: 'Test Media 2',
          description: 'Test Description 2',
          category: 'training',
          date: new Date('2024-01-02'),
          mediaType: 'video/mp4',
          mediaUrl: 'https://example.com/media2.mp4',
          videoThumbnail: 'https://example.com/thumb2.jpg'
        }
      ]

      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockMedia),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1')
      const response = await GET(request, {
        params: Promise.resolve({ athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual(mockMedia)
      expect(mockSelectSpy).toHaveBeenCalled()
    })

    it('should return empty array for athlete with no media', async () => {
      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/999')
      const response = await GET(request, {
        params: Promise.resolve({ athleteId: '999' })
      })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual([])
      expect(mockSelectSpy).toHaveBeenCalled()
    })
  })

  describe('PUT - Integration', () => {
    const createMockFormData = (overrides: any = {}) => {
      const formData = new FormData()
      formData.append('name', overrides.name || 'Updated Media')
      formData.append('description', overrides.description || 'Updated Description')
      formData.append('category', overrides.category || 'training')
      formData.append('date', overrides.date || '2024-02-01')
      
      return formData
    }

    it('should update media metadata successfully', async () => {
      const formData = createMockFormData()
      
      const mockUpdateSpy = jest.spyOn(db, 'update').mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'PUT',
        body: formData,
      })

      const response = await PUT(request)
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(mockUpdateSpy).toHaveBeenCalledWith(media)
    })

    it('should handle missing mediaId parameter', async () => {
      const formData = createMockFormData()

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'PUT',
        body: formData,
      })

      const response = await PUT(request)
      const data = await response.json()

      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing mediaId query param')
    })
  })

  describe('DELETE - Integration', () => {
    it('should delete media and associated S3 files', async () => {
      const mockMedia = {
        id: 1,
        athlete: 1,
        name: 'Test Media',
        description: 'Test Description',
        category: 'competition',
        date: new Date('2024-01-01'),
        mediaType: 'video/mp4',
        mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/athlete/media/test-uuid-test.mp4',
        videoThumbnail: 'https://test-bucket.s3.us-east-1.amazonaws.com/athlete/media/thumbnails/test-uuid.jpg'
      }

      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockMedia]),
        }),
      } as any)
      
      const mockDeleteSpy = jest.spyOn(db, 'delete').mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(mockSelectSpy).toHaveBeenCalled()
      expect(mockDeleteSpy).toHaveBeenCalledWith(media)
    })

    it('should handle media not found', async () => {
      const mockSelectSpy = jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=999', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 404)
      validateErrorResponse(data, 'Media not found')
      expect(mockSelectSpy).toHaveBeenCalled()
    })

    it('should handle missing mediaId parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing mediaId query param')
    })
  })

  describe('Error Handling - Integration', () => {
    it('should handle database connection errors', async () => {
      const mockError = new Error('Database connection failed')
      jest.spyOn(db, 'select').mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1')
      const response = await GET(request, {
        params: Promise.resolve({ athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle S3 service errors', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('mediaType', 'image/jpeg')
      formData.append('name', 'Test Media')
      formData.append('description', 'Test Description')
      formData.append('category', 'competition')
      formData.append('date', '2024-01-01')
      formData.append('media', mockFile)
      
      const { S3Client } = require('@aws-sdk/client-s3')
      const mockS3Client = S3Client.mock.instances[0]
      mockS3Client.send.mockRejectedValueOnce(new Error('S3 service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request, {
        params: Promise.resolve({ userId: '1', athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 service unavailable')
    })
  })
}) 