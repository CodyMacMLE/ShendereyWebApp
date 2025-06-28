/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { gallery } from '@/lib/schema'
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

// Mock tmp-promise
jest.mock('tmp-promise', () => ({
  file: jest.fn().mockResolvedValue({
    path: '/tmp/test-file.jpg',
    cleanup: jest.fn(),
  }),
}))

// Mock fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('test-thumbnail')),
}))

// Mock fluent-ffmpeg
jest.mock('fluent-ffmpeg', () => {
  const mockFfmpeg = jest.fn().mockImplementation(() => ({
    on: jest.fn().mockImplementation((event, callback) => {
      if (event === 'end') {
        // Immediately call the end callback to simulate successful completion
        setTimeout(() => callback(), 0)
      }
      return mockFfmpeg()
    }),
    screenshots: jest.fn().mockReturnThis(),
  }))
  
  ;(mockFfmpeg as any).ffprobe = jest.fn().mockImplementation((path: string, callback: (err: any, metadata: any) => void) => {
    // Immediately call the callback to simulate fast video analysis
    setTimeout(() => {
      callback(null, {
        streams: [
          { width: 1920, height: 1080 }
        ]
      })
    }, 0)
  })
  
  ;(mockFfmpeg as any).setFfmpegPath = jest.fn()
  
  return mockFfmpeg
})

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

// Helper function to create mock gallery data
export const createMockGalleryItem = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'Test Gallery Item',
  description: 'Test description',
  date: '2024-01-01T00:00:00.000Z', // API returns dates as strings
  mediaType: 'image/jpeg',
  mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/test-uuid-123-test.jpg',
  videoThumbnail: '',
  ...overrides,
})

// Helper function to create mock file
const createMockFile = (name: string, type: string, content: string = 'test-content'): File => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

// Helper function to validate gallery data structure
export const validateGalleryDataStructure = (galleryItem: any) => {
  expect(galleryItem).toHaveProperty('id')
  expect(galleryItem).toHaveProperty('name')
  expect(galleryItem).toHaveProperty('description')
  expect(galleryItem).toHaveProperty('date')
  expect(galleryItem).toHaveProperty('mediaType')
  expect(galleryItem).toHaveProperty('mediaUrl')
  expect(galleryItem).toHaveProperty('videoThumbnail')
  
  expect(typeof galleryItem.id).toBe('number')
  expect(typeof galleryItem.name).toBe('string')
  expect(typeof galleryItem.description).toBe('string')
  expect(typeof galleryItem.date).toBe('string') // API returns dates as strings
  expect(typeof galleryItem.mediaType).toBe('string')
  expect(typeof galleryItem.mediaUrl).toBe('string')
  expect(typeof galleryItem.videoThumbnail).toBe('string')
}

describe('/api/gallery', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all gallery items successfully', async () => {
      // Mock data
      const mockGalleryItems = [
        createMockGalleryItem({ id: 1, name: 'Item 1' }),
        createMockGalleryItem({ id: 2, name: 'Item 2', mediaType: 'video/mp4' }),
      ]

      // Mock the database query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockGalleryItems)
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockGalleryItems)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should return empty array when no gallery items exist', async () => {
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

    it('should include correct gallery data structure', async () => {
      // Mock data with all fields
      const mockGalleryItem = createMockGalleryItem()

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([mockGalleryItem])
      } as any)

      // Call the API
      const response = await GET()
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      validateGalleryDataStructure(data.body[0])
    })
  })

  describe('POST', () => {
    it('should create gallery item with image successfully', async () => {
      // Mock data
      const mockGalleryItem = createMockGalleryItem()
      const mockFile = createMockFile('test.jpg', 'image/jpeg')

      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'image/jpeg')
      mockFormData.append('media', mockFile)
      mockFormData.append('name', 'Test Image')
      mockFormData.append('description', 'Test description')
      mockFormData.append('date', '2024-01-01')

      // Mock the database insert
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockGalleryItem])
        })
      } as any)

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockGalleryItem)
      expect(mockDb.insert).toHaveBeenCalledWith(gallery)
    })

    it('should create gallery item with video and generate thumbnail', async () => {
      // Mock data
      const mockGalleryItem = createMockGalleryItem({
        mediaType: 'video/mp4',
        videoThumbnail: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/thumbnails/test-uuid-123.jpg'
      })
      const mockFile = createMockFile('test.mp4', 'video/mp4')

      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'video/mp4')
      mockFormData.append('media', mockFile)
      mockFormData.append('name', 'Test Video')
      mockFormData.append('description', 'Test video description')
      mockFormData.append('date', '2024-01-01')

      // Mock the database insert
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockGalleryItem])
        })
      } as any)

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockGalleryItem)
      expect(data.body.videoThumbnail).toContain('thumbnails/test-uuid-123.jpg')
    }, 10000) // Increase timeout for video processing

    it('should handle missing required fields gracefully', async () => {
      // Mock form data with missing fields
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'image/jpeg')
      // Missing media, name, description, date

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock the database insert with empty values
      const mockGalleryItem = createMockGalleryItem({
        name: '',
        description: '',
        date: null,
        mediaUrl: ''
      })
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockGalleryItem])
        })
      } as any)

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.name).toBe('')
      expect(data.body.description).toBe('')
      expect(data.body.date).toBeNull()
    })

    it('should handle database errors during creation', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'image/jpeg')
      mockFormData.append('name', 'Test Item')

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock database error
      const mockError = new Error('Database insert failed')
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError)
        })
      } as any)

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database insert failed')
    })

    it('should handle S3 upload errors', async () => {
      // Mock form data with file
      const mockFile = createMockFile('test.jpg', 'image/jpeg')
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'image/jpeg')
      mockFormData.append('media', mockFile)
      mockFormData.append('name', 'Test Item')

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock S3 error by making the file throw an error
      jest.spyOn(mockFile, 'arrayBuffer').mockRejectedValue(new Error('S3 upload failed'))

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 upload failed')
    })

    it('should handle video processing errors', async () => {
      // Mock form data with video
      const mockFile = createMockFile('test.mp4', 'video/mp4')
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'video/mp4')
      mockFormData.append('media', mockFile)
      mockFormData.append('name', 'Test Video')

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock ffmpeg error
      const Ffmpeg = require('fluent-ffmpeg')
      ;(Ffmpeg.ffprobe as jest.Mock).mockImplementation((path: string, callback: (err: any, metadata: any) => void) => {
        callback(new Error('FFmpeg error'), null)
      })

      // Mock the database insert
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createMockGalleryItem()])
        })
      } as any)

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'FFmpeg error')
    })

    it('should handle portrait video thumbnail generation', async () => {
      // Mock data
      const mockGalleryItem = createMockGalleryItem({
        mediaType: 'video/mp4',
        videoThumbnail: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/thumbnails/test-uuid-123.jpg'
      })
      const mockFile = createMockFile('test.mp4', 'video/mp4')

      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'video/mp4')
      mockFormData.append('media', mockFile)
      mockFormData.append('name', 'Test Portrait Video')

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock portrait video dimensions
      const Ffmpeg = require('fluent-ffmpeg')
      ;(Ffmpeg.ffprobe as jest.Mock).mockImplementation((path: string, callback: (err: any, metadata: any) => void) => {
        callback(null, {
          streams: [
            { width: 1080, height: 1920 } // Portrait dimensions
          ]
        })
      })

      // Mock the database insert
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockGalleryItem])
        })
      } as any)

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, mockGalleryItem)
    }, 10000) // Increase timeout for video processing

    it('should handle non-file media gracefully', async () => {
      // Mock form data without file
      const mockFormData = new FormData()
      mockFormData.append('mediaType', 'image/jpeg')
      mockFormData.append('name', 'Test Item')
      mockFormData.append('description', 'Test description')

      // Mock request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest

      // Mock the database insert with empty mediaUrl
      const mockGalleryItem = createMockGalleryItem({
        mediaUrl: ''
      })
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockGalleryItem])
        })
      } as any)

      // Call the API
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.mediaUrl).toBe('')
    })
  })
}) 