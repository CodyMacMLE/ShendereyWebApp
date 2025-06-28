/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { validateApiResponse, validateErrorResponse, validateSuccessResponse } from '@/test-utils/test-utils.helper'
import { NextRequest } from 'next/server'
import { DELETE, GET, POST, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
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

describe('/api/users/[userId]/media/[athleteId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_BUCKET_NAME = 'test-bucket'
  })

  describe('POST', () => {
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

    it('should create media successfully with image file', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg')
      const formData = createMockFormData({ media: mockFile })
      
      const mockInsertedMedia = [{ id: 1 }]
      const mockFetchedMedia = [
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
      ]

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(mockInsertedMedia),
      } as any)
      
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockFetchedMedia),
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
      expect(data.body).toEqual(mockFetchedMedia)
    })

    it('should create media successfully with video file and generate thumbnail', async () => {
      const mockFile = createMockFile('test.mp4', 'video/mp4')
      const formData = createMockFormData({ 
        media: mockFile,
        mediaType: 'video/mp4'
      })
      
      const mockInsertedMedia = [{ id: 1 }]
      const mockFetchedMedia = [
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
      ]

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(mockInsertedMedia),
      } as any)
      
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockFetchedMedia),
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
      expect(data.body).toEqual(mockFetchedMedia)
    })

    it('should handle missing media file gracefully', async () => {
      const formData = createMockFormData()
      
      const mockInsertedMedia = [{ id: 1 }]
      const mockFetchedMedia = [
        {
          id: 1,
          athlete: 1,
          name: 'Test Media',
          description: 'Test Description',
          category: 'competition',
          date: new Date('2024-01-01'),
          mediaType: 'image/jpeg',
          mediaUrl: '',
          videoThumbnail: ''
        }
      ]

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(mockInsertedMedia),
      } as any)
      
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockFetchedMedia),
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
      expect(data.body[0].mediaUrl).toBe('')
    })

    it('should handle database errors gracefully', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg')
      const formData = createMockFormData({ media: mockFile })
      
      const mockError = new Error('Database connection failed')
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockRejectedValue(mockError),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request, {
        params: Promise.resolve({ userId: '1', athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle S3 upload errors gracefully', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg')
      const formData = createMockFormData({ media: mockFile })
      
      const { S3Client } = require('@aws-sdk/client-s3')
      const mockS3Client = S3Client.mock.instances[0]
      mockS3Client.send.mockRejectedValueOnce(new Error('S3 upload failed'))

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request, {
        params: Promise.resolve({ userId: '1', athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 upload failed')
    })
  })

  describe('GET', () => {
    it('should return all media for an athlete successfully', async () => {
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

      mockDb.select.mockReturnValueOnce({
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
    })

    it('should return empty array when no media exists for athlete', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1')
      const response = await GET(request, {
        params: Promise.resolve({ athleteId: '1' })
      })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValueOnce({
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
  })

  describe('PUT', () => {
    const createMockFormData = (overrides: any = {}) => {
      const formData = new FormData()
      formData.append('name', overrides.name || 'Updated Media')
      formData.append('description', overrides.description || 'Updated Description')
      formData.append('category', overrides.category || 'training')
      formData.append('date', overrides.date || '2024-02-01')
      
      return formData
    }

    it('should update media successfully', async () => {
      const formData = createMockFormData()
      
      mockDb.update.mockReturnValueOnce({
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

    it('should handle database errors gracefully', async () => {
      const formData = createMockFormData()
      const mockError = new Error('Database update failed')
      
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'PUT',
        body: formData,
      })

      const response = await PUT(request)
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database update failed')
    })
  })

  describe('DELETE', () => {
    it('should delete media and associated S3 files successfully', async () => {
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

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockMedia]),
        }),
      } as any)
      
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue({}),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
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

    it('should handle media not found', async () => {
      mockDb.select.mockReturnValueOnce({
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
    })

    it('should handle S3 deletion errors gracefully', async () => {
      const mockMedia = {
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

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockMedia]),
        }),
      } as any)
      
      const { S3Client } = require('@aws-sdk/client-s3')
      const mockS3Client = S3Client.mock.instances[0]
      mockS3Client.send.mockRejectedValueOnce(new Error('S3 deletion failed'))

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 deletion failed')
    })

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database deletion failed')
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/users/1/media/1?mediaId=1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database deletion failed')
    })
  })
}) 