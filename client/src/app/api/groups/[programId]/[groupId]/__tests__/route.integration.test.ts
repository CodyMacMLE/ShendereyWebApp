/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { DELETE, PUT } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    delete: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}))

// Mock NextRequest and NextResponse
const mockNextRequest = {
  formData: jest.fn(),
} as any

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

describe('/api/groups/[programId]/[groupId] Integration Tests', () => {
  const mockDb = db as jest.Mocked<typeof db>
  let testGroupId: number
  let testCoachId: number
  let testUserId: number

  beforeAll(() => {
    // Set up test data IDs
    testUserId = 1
    testCoachId = 1
    testGroupId = 1
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should delete a group and its associated coach group lines', async () => {
      // Mock successful deletion
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the DELETE endpoint
      const response = await DELETE(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group).toBe(testGroupId)

      // Verify database calls were made
      expect(mockDb.delete).toHaveBeenCalledTimes(2)
    })

    it('should handle deletion of group without coach group lines', async () => {
      // Mock successful deletion
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the DELETE endpoint
      const response = await DELETE(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: '2' })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group).toBe(2)

      // Verify database calls were made
      expect(mockDb.delete).toHaveBeenCalledTimes(2)
    })

    it('should handle invalid group ID gracefully', async () => {
      // Mock successful deletion (the route doesn't validate parseInt result)
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the DELETE endpoint with invalid group ID
      const response = await DELETE(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: 'invalid' })
      })

      const data = await response.json()

      // Verify response - the route actually succeeds with NaN group
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group).toBe(NaN)
    })

    it('should handle non-existent group ID', async () => {
      // Mock successful deletion (DELETE is idempotent)
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the DELETE endpoint with non-existent group ID
      const response = await DELETE(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: '99999' })
      })

      const data = await response.json()

      // Verify response (should still succeed as DELETE is idempotent)
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group).toBe(99999)
    })
  })

  describe('PUT', () => {
    it('should update a group with all fields and create coach group line', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('coachId', testCoachId.toString())
      mockFormData.append('day', 'Thursday')
      mockFormData.append('startTime', '16:00:00')
      mockFormData.append('endTime', '17:00:00')
      mockFormData.append('startDate', '2024-02-01')
      mockFormData.append('endDate', '2024-07-01')

      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update
      const updatedGroup = {
        id: testGroupId,
        program: 1,
        day: 'Thursday',
        startTime: '16:00:00',
        endTime: '17:00:00',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-01'),
        active: true,
      }

      const updatedCoachGroupLine = {
        id: 1,
        coachId: testCoachId,
        groupId: testGroupId,
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]), // No existing coach group line
        }),
      } as any)

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([updatedCoachGroupLine]),
        }),
      } as any)

      // Call the PUT endpoint
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group.id).toBe(testGroupId)
      expect(data.body.group.day).toBe('Thursday')
      expect(data.body.group.startTime).toBe('16:00:00')
      expect(data.body.group.endTime).toBe('17:00:00')
      expect(data.body.coachGroupLine).toBeDefined()
      expect(data.body.coachGroupLine.coachId).toBe(testCoachId)
    })

    it('should update existing coach group line', async () => {
      // Mock form data to update coach
      const mockFormData = new FormData()
      mockFormData.append('coachId', '2')
      mockFormData.append('day', 'Saturday')

      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update
      const updatedGroup = {
        id: testGroupId,
        program: 1,
        day: 'Saturday',
        startTime: '18:00:00',
        endTime: '19:00:00',
        active: true,
      }

      const existingCoachGroupLine = {
        id: 1,
        coachId: testCoachId,
        groupId: testGroupId,
      }

      const updatedCoachGroupLine = {
        id: 1,
        coachId: 2,
        groupId: testGroupId,
      }

      // First call for group update
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingCoachGroupLine]),
        }),
      } as any)

      // Second call for coach group line update
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedCoachGroupLine]),
          }),
        }),
      } as any)

      // Call the PUT endpoint
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group.day).toBe('Saturday')
      expect(data.body.coachGroupLine.coachId).toBe(2)
    })

    it('should update group without coach when coachId is not provided', async () => {
      // Mock form data without coachId
      const mockFormData = new FormData()
      mockFormData.append('day', 'Monday')
      mockFormData.append('startTime', '21:00:00')
      mockFormData.append('endTime', '22:00:00')

      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update
      const updatedGroup = {
        id: testGroupId,
        program: 1,
        day: 'Monday',
        startTime: '21:00:00',
        endTime: '22:00:00',
        active: true,
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Call the PUT endpoint
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group.day).toBe('Monday')
      expect(data.body.group.startTime).toBe('21:00:00')
      expect(data.body.group.endTime).toBe('22:00:00')
      expect(data.body.coachGroupLine).toBeNull()
    })

    it('should handle partial updates gracefully', async () => {
      // Mock form data with only day update
      const mockFormData = new FormData()
      mockFormData.append('day', 'Wednesday')

      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update
      const updatedGroup = {
        id: testGroupId,
        program: 1,
        day: 'Wednesday',
        startTime: '',
        endTime: '',
        active: true,
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Call the PUT endpoint
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group.day).toBe('Wednesday')
      expect(data.body.group.startTime).toBe('') // Should be empty string as per route logic
      expect(data.body.group.endTime).toBe('') // Should be empty string as per route logic
    })

    it('should handle empty form data', async () => {
      // Mock empty form data
      const mockFormData = new FormData()
      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update with default values
      const updatedGroup = {
        id: testGroupId,
        program: 1,
        day: '',
        startTime: '',
        endTime: '',
        active: true,
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Call the PUT endpoint
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: testGroupId.toString() })
      })

      const data = await response.json()

      // Verify response
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group.day).toBe('')
      expect(data.body.group.startTime).toBe('')
      expect(data.body.group.endTime).toBe('')
    })

    it('should handle invalid group ID', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Friday')
      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock database error when NaN is passed
      const dbError = new Error('Invalid input syntax for type integer')
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(dbError),
          }),
        }),
      } as any)

      // Call the PUT endpoint with invalid group ID
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: 'invalid' })
      })

      const data = await response.json()

      // Verify error response
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid input syntax for type integer')
    })

    it('should handle non-existent group ID', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Saturday')
      mockNextRequest.formData = jest.fn().mockResolvedValue(mockFormData)

      // Mock successful update (should still work even for non-existent ID)
      const updatedGroup = {
        id: 99999,
        program: 1,
        day: 'Saturday',
        startTime: '',
        endTime: '',
        active: true,
      }

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Call the PUT endpoint with non-existent group ID
      const response = await PUT(mockNextRequest, {
        params: Promise.resolve({ programId: '1', groupId: '99999' })
      })

      const data = await response.json()

      // Verify response (should succeed but return empty result)
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.body.group).toBeDefined()
    })
  })
}) 