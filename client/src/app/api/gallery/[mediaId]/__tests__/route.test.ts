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
import { DELETE, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock AWS S3
let sendMock: jest.Mock;
jest.mock('@aws-sdk/client-s3', () => {
  class S3ClientMock {
    send(...args: any[]) {
      return sendMock(...args);
    }
  }
  return {
    S3Client: S3ClientMock,
    DeleteObjectCommand: jest.fn(),
  };
});

beforeEach(() => {
  sendMock = jest.fn().mockResolvedValue({});
});

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

// Helper function to create mock gallery item
const createMockGalleryItem = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'Test Gallery Item',
  description: 'Test description',
  date: new Date('2024-01-01T00:00:00.000Z'),
  mediaType: 'image/jpeg',
  mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/test-uuid-123-test.jpg',
  videoThumbnail: '',
  ...overrides,
})

// Helper function to create mock form data
const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value.toString())
    }
  })
  return formData
}

// Helper function to create mock request
const createMockRequest = (formData: FormData) => {
  return {
    formData: jest.fn().mockResolvedValue(formData),
  } as unknown as NextRequest
}

describe('/api/gallery/[mediaId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT', () => {
    it('should update gallery item successfully', async () => {
      const mediaId = '1'
      const formData = createMockFormData({
        name: 'Updated Gallery Item',
        description: 'Updated description',
        date: '2024-01-15T00:00:00.000Z',
      })
      const req = createMockRequest(formData)

      // Mock the database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await PUT(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(mockDb.update).toHaveBeenCalledWith(gallery)
    })

    it('should handle missing mediaId parameter', async () => {
      const formData = createMockFormData({
        name: 'Updated Gallery Item',
        description: 'Updated description',
      })
      const req = createMockRequest(formData)

      // Call the API with missing mediaId
      const response = await PUT(req, { params: Promise.resolve({ mediaId: '' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing mediaId query param')
    })

    it('should handle empty form data gracefully', async () => {
      const mediaId = '1'
      const formData = createMockFormData({})
      const req = createMockRequest(formData)

      // Mock the database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await PUT(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle null date values', async () => {
      const mediaId = '1'
      const formData = createMockFormData({
        name: 'Updated Gallery Item',
        description: 'Updated description',
        date: null,
      })
      const req = createMockRequest(formData)

      // Mock the database update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await PUT(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle database errors gracefully', async () => {
      const mediaId = '1'
      const formData = createMockFormData({
        name: 'Updated Gallery Item',
        description: 'Updated description',
      })
      const req = createMockRequest(formData)

      // Mock database error
      const mockError = new Error('Database update failed')
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Call the API
      const response = await PUT(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database update failed')
    })

    it('should handle unknown errors gracefully', async () => {
      const mediaId = '1'
      const formData = createMockFormData({
        name: 'Updated Gallery Item',
        description: 'Updated description',
      })
      const req = createMockRequest(formData)

      // Mock unknown error
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue('Unknown error'),
        }),
      } as any)

      // Call the API
      const response = await PUT(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Unknown error')
    })
  })

  describe('DELETE', () => {
    it('should delete gallery item successfully', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({
        id: 1,
        mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/test-image.jpg',
      })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.delete).toHaveBeenCalledWith(gallery)
    })

    it('should delete gallery item with video thumbnail', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({
        id: 1,
        mediaType: 'video/mp4',
        mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/test-video.mp4',
        videoThumbnail: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/thumbnails/test-video.jpg',
      })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle missing mediaId parameter', async () => {
      const req = {} as NextRequest

      // Call the API with missing mediaId
      const response = await DELETE(req, { params: Promise.resolve({ mediaId: '' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing mediaId query param')
    })

    it('should handle media not found', async () => {
      const mediaId = '999'
      const req = {} as NextRequest

      // Mock empty result (media not found)
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 404)
      validateErrorResponse(data, 'Media not found')
    })

    it('should handle gallery item without mediaUrl', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({
        id: 1,
        mediaUrl: null,
        videoThumbnail: null,
      })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle invalid S3 URL format', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({
        id: 1,
        mediaUrl: 'invalid-url-format',
        videoThumbnail: 'also-invalid',
      })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
    })

    it('should handle S3 delete errors gracefully', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({
        id: 1,
        mediaUrl: 'https://test-bucket.s3.us-east-1.amazonaws.com/gallery/test-image.jpg',
      })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock the database delete
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      } as any)

      // Mock send to throw
      sendMock.mockRejectedValueOnce(new Error('S3 delete failed'))

      // Call the API to test error handling
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'S3 delete failed')
    })

    it('should handle database select errors gracefully', async () => {
      const mediaId = '1'
      const req = {} as NextRequest

      // Mock database select error
      const mockError = new Error('Database select failed')
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database select failed')
    })

    it('should handle database delete errors gracefully', async () => {
      const mediaId = '1'
      const mockGalleryItem = createMockGalleryItem({ id: 1 })
      const req = {} as NextRequest

      // Mock the database select
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockGalleryItem]),
        }),
      } as any)

      // Mock database delete error
      const mockError = new Error('Database delete failed')
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockRejectedValue(mockError),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database delete failed')
    })

    it('should handle unknown errors gracefully', async () => {
      const mediaId = '1'
      const req = {} as NextRequest

      // Mock unknown error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue('Unknown error'),
        }),
      } as any)

      // Call the API
      const response = await DELETE(req, { params: Promise.resolve({ mediaId }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Unknown error')
    })
  })
}) 