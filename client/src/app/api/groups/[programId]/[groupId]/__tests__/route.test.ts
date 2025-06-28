/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import {
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse
} from '@/test-utils/test-utils.helper'
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

// Helper function to create mock group data
const createMockGroup = (overrides: Partial<any> = {}) => ({
  id: 1,
  program: 1,
  day: 'Monday',
  startTime: '09:00:00',
  endTime: '10:00:00',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-06-01'),
  active: true,
  ...overrides,
})

// Helper function to create mock coach group line data
const createMockCoachGroupLine = (overrides: Partial<any> = {}) => ({
  id: 1,
  coachId: 1,
  groupId: 1,
  ...overrides,
})

// Helper function to validate group data structure
const validateGroupDataStructure = (group: any) => {
  expect(group).toHaveProperty('id')
  expect(group).toHaveProperty('program')
  expect(group).toHaveProperty('day')
  expect(group).toHaveProperty('startTime')
  expect(group).toHaveProperty('endTime')
  expect(group).toHaveProperty('startDate')
  expect(group).toHaveProperty('endDate')
  expect(group).toHaveProperty('active')
  
  expect(typeof group.id).toBe('number')
  expect(typeof group.program).toBe('number')
  expect(typeof group.day).toBe('string')
  expect(typeof group.active).toBe('boolean')
}

describe('/api/groups/[programId]/[groupId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {
    it('should successfully delete a group and its coach group lines', async () => {
      // Mock successful deletion
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await DELETE({} as any, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group).toBe(1)
      expect(mockDb.delete).toHaveBeenCalledTimes(2)
    })

    it('should handle database errors during deletion', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed')
      mockDb.delete.mockImplementation(() => {
        throw dbError
      })

      // Call the API
      const response = await DELETE({} as any, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle invalid group ID format gracefully', async () => {
      // Mock successful deletion (the route doesn't validate parseInt result)
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API with invalid group ID
      const response = await DELETE({} as any, { 
        params: Promise.resolve({ programId: '1', groupId: 'invalid' }) 
      })
      const data = await response.json()

      // Assertions - the route actually succeeds with null group in unit test environment
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group).toBe(null)
    })

    it('should handle non-numeric group ID gracefully', async () => {
      // Mock successful deletion (the route doesn't validate parseInt result)
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API with non-numeric group ID
      const response = await DELETE({} as any, { 
        params: Promise.resolve({ programId: '1', groupId: 'abc123' }) 
      })
      const data = await response.json()

      // Assertions - the route actually succeeds with null group in unit test environment
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group).toBe(null)
    })
  })

  describe('PUT', () => {
    it('should successfully update a group with all fields', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('coachId', '1')
      mockFormData.append('day', 'Tuesday')
      mockFormData.append('startTime', '10:00:00')
      mockFormData.append('endTime', '11:00:00')
      mockFormData.append('startDate', '2024-02-01')
      mockFormData.append('endDate', '2024-07-01')

      // Mock successful update
      const updatedGroup = createMockGroup({
        id: 1,
        day: 'Tuesday',
        startTime: '10:00:00',
        endTime: '11:00:00',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-01'),
      })

      const updatedCoachGroupLine = createMockCoachGroupLine({
        groupId: 1,
        coachId: 1,
      })

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

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      validateGroupDataStructure(data.body.group)
      expect(data.body.group.day).toBe('Tuesday')
      expect(data.body.group.startTime).toBe('10:00:00')
      expect(data.body.group.endTime).toBe('11:00:00')
      expect(data.body.coachGroupLine).toBeDefined()
      expect(data.body.coachGroupLine.coachId).toBe(1)
    })

    it('should update group without coach when coachId is not provided', async () => {
      // Mock form data without coachId
      const mockFormData = new FormData()
      mockFormData.append('day', 'Wednesday')
      mockFormData.append('startTime', '14:00:00')
      mockFormData.append('endTime', '15:00:00')

      // Mock successful update
      const updatedGroup = createMockGroup({
        id: 1,
        day: 'Wednesday',
        startTime: '14:00:00',
        endTime: '15:00:00',
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      validateGroupDataStructure(data.body.group)
      expect(data.body.group.day).toBe('Wednesday')
      expect(data.body.coachGroupLine).toBeNull()
    })

    it('should update existing coach group line when one exists', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('coachId', '2')
      mockFormData.append('day', 'Thursday')

      // Mock successful update
      const updatedGroup = createMockGroup({
        id: 1,
        day: 'Thursday',
      })

      const existingCoachGroupLine = createMockCoachGroupLine({
        groupId: 1,
        coachId: 1,
      })

      const updatedCoachGroupLine = createMockCoachGroupLine({
        groupId: 1,
        coachId: 2,
      })

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

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.day).toBe('Thursday')
      expect(data.body.coachGroupLine.coachId).toBe(2)
    })

    it('should create new coach group line when none exists', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('coachId', '3')
      mockFormData.append('day', 'Friday')

      // Mock successful update
      const updatedGroup = createMockGroup({
        id: 1,
        day: 'Friday',
      })

      const newCoachGroupLine = createMockCoachGroupLine({
        groupId: 1,
        coachId: 3,
      })

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
          returning: jest.fn().mockResolvedValue([newCoachGroupLine]),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.day).toBe('Friday')
      expect(data.body.coachGroupLine.coachId).toBe(3)
    })

    it('should handle database errors during update', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Monday')

      // Mock database error
      const dbError = new Error('Update failed')
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(dbError),
          }),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Update failed')
    })

    it('should handle invalid group ID format by passing NaN to database', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Monday')

      // Mock database error when NaN is passed
      const dbError = new Error('Invalid input syntax for type integer')
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(dbError),
          }),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API with invalid group ID
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: 'invalid' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Invalid input syntax for type integer')
    })

    it('should handle empty form data gracefully', async () => {
      // Mock empty form data
      const mockFormData = new FormData()

      // Mock successful update with default values
      const updatedGroup = createMockGroup({
        id: 1,
        day: '',
        startTime: '',
        endTime: '',
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.day).toBe('')
      expect(data.body.group.startTime).toBe('')
      expect(data.body.group.endTime).toBe('')
    })

    it('should handle partial form data updates', async () => {
      // Mock partial form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Saturday')
      // Only day is provided, other fields should remain unchanged

      // Mock successful update
      const updatedGroup = createMockGroup({
        id: 1,
        day: 'Saturday',
        startTime: '',
        endTime: '',
      })

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedGroup]),
          }),
        }),
      } as any)

      // Mock request with form data
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Call the API
      const response = await PUT(mockRequest, { 
        params: Promise.resolve({ programId: '1', groupId: '1' }) 
      })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.day).toBe('Saturday')
    })
  })
}) 