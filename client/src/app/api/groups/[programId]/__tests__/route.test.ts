/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import {
    createMockCoach,
    createMockUser,
    validateApiResponse,
    validateErrorResponse,
    validateSuccessResponse
} from '@/test-utils/test-utils.helper'
import { GET, POST } from '../route'

// Mock the database module
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  inArray: jest.fn(),
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
  expect(group).toHaveProperty('coaches')
  
  expect(typeof group.id).toBe('number')
  expect(typeof group.program).toBe('number')
  expect(typeof group.day).toBe('string')
  expect(typeof group.active).toBe('boolean')
  expect(Array.isArray(group.coaches)).toBe(true)
}

describe('/api/groups/[programId]', () => {
  const mockDb = db as jest.Mocked<typeof db>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return groups for a valid program ID with coach information', async () => {
      // Mock data
      const mockGroups = [
        createMockGroup({ id: 1, program: 1 }),
        createMockGroup({ id: 2, program: 1, day: 'Tuesday' }),
      ]
      const mockCoachGroupLines1 = [createMockCoachGroupLine({ groupId: 1, coachId: 1 })]
      const mockCoachGroupLines2 = [createMockCoachGroupLine({ groupId: 2, coachId: 2 })]
      const mockCoaches1 = [createMockCoach({ id: 1, user: 1 })]
      const mockCoaches2 = [createMockCoach({ id: 2, user: 2 })]
      const mockUsers1 = [createMockUser({ id: 1, name: 'John Doe' })]
      const mockUsers2 = [createMockUser({ id: 2, name: 'Jane Smith' })]

      // Mock the database query chain for groups
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockGroups),
        }),
      } as any)
      // For group 1
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCoachGroupLines1),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCoaches1),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockUsers1),
        }),
      } as any)
      // For group 2
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCoachGroupLines2),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCoaches2),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockUsers2),
        }),
      } as any)

      // Call the API
      const response = await GET({} as any, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toHaveLength(2)
      validateGroupDataStructure(data.body[0])
      expect(data.body[0].coaches).toHaveLength(1)
      expect(data.body[0].coaches[0].name).toBe('John Doe')
      expect(data.body[1].coaches).toHaveLength(1)
      expect(data.body[1].coaches[0].name).toBe('Jane Smith')
    })

    it('should return empty array when no groups exist for program', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      // Call the API
      const response = await GET({} as any, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
    })

    it('should handle groups with no coaches', async () => {
      // Mock data
      const mockGroups = [createMockGroup()]
      const mockCoachGroupLines: any[] = [] // No coaches

      // Mock the database query chain
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockGroups),
        }),
      } as any)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCoachGroupLines),
        }),
      } as any)

      // Call the API
      const response = await GET({} as any, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body[0].coaches).toHaveLength(0)
    })

    it('should return 400 error for missing program ID', async () => {
      // Call the API with invalid program ID
      const response = await GET({} as any, { params: Promise.resolve({ programId: '' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing program ID')
    })

    it('should return 400 error for invalid program ID', async () => {
      // Call the API with invalid program ID
      const response = await GET({} as any, { params: Promise.resolve({ programId: 'invalid' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Missing program ID')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed')
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Call the API
      const response = await GET({} as any, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database connection failed')
    })

    it('should handle unknown errors gracefully', async () => {
      // Mock unknown error
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockRejectedValue('Unknown error'),
        }),
      } as any)

      // Call the API
      const response = await GET({} as any, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Unknown error')
    })
  })

  describe('POST', () => {
    it('should create a new group successfully', async () => {
      // Mock data
      const mockNewGroup = createMockGroup()
      const mockNewCoachGroupLine = createMockCoachGroupLine()

      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('coachId', '1')
      mockFormData.append('day', 'Monday')
      mockFormData.append('startTime', '09:00')
      mockFormData.append('endTime', '10:00')
      mockFormData.append('startDate', '2024-01-01')
      mockFormData.append('endDate', '2024-06-01')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database insert operations
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewCoachGroupLine]),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      // Compare ISO strings for dates
      expect(data.body.group).toMatchObject({
        ...mockNewGroup,
        startDate: mockNewGroup.startDate.toISOString(),
        endDate: mockNewGroup.endDate.toISOString(),
      })
      expect(data.body.coachGroupLine).toEqual(mockNewCoachGroupLine)
    })

    it('should create a group without coach successfully', async () => {
      // Mock form data without coach
      const mockFormData = new FormData()
      mockFormData.append('day', 'Monday')
      mockFormData.append('startTime', '09:00')
      mockFormData.append('endTime', '10:00')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database insert operation
      const mockNewGroup = createMockGroup()
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group).toMatchObject({
        ...mockNewGroup,
        startDate: mockNewGroup.startDate.toISOString(),
        endDate: mockNewGroup.endDate.toISOString(),
      })
      expect(data.body.coachGroupLine).toBeNull()
    })

    it('should handle missing form data gracefully', async () => {
      // Mock empty form data
      const mockFormData = new FormData()

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database insert operation
      const mockNewGroup = createMockGroup({
        day: '',
        startTime: '',
        endTime: '',
        startDate: undefined,
        endDate: undefined,
      })
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.day).toBe('')
      expect(data.body.group.startTime).toBe('')
      expect(data.body.group.endTime).toBe('')
    })

    it('should handle database errors gracefully', async () => {
      // Mock form data
      const mockFormData = new FormData()
      mockFormData.append('day', 'Monday')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database error
      const mockError = new Error('Database insert failed')
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Database insert failed')
    })

    it('should handle coach group line creation errors gracefully', async () => {
      // Mock form data with coach
      const mockFormData = new FormData()
      mockFormData.append('coachId', '1')
      mockFormData.append('day', 'Monday')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock successful group creation
      const mockNewGroup = createMockGroup()
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      // Mock failed coach group line creation
      const mockError = new Error('Coach group line creation failed')
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      validateErrorResponse(data, 'Coach group line creation failed')
    })

    it('should handle invalid coach ID gracefully', async () => {
      // Mock form data with invalid coach ID
      const mockFormData = new FormData()
      mockFormData.append('coachId', 'invalid')
      mockFormData.append('day', 'Monday')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database insert operation
      const mockNewGroup = createMockGroup()
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.coachGroupLine).toBeNull()
    })

    it('should handle invalid date formats gracefully', async () => {
      // Mock form data with invalid dates
      const mockFormData = new FormData()
      mockFormData.append('startDate', 'invalid-date')
      mockFormData.append('endDate', 'invalid-date')

      // Mock the request
      const mockRequest = {
        formData: jest.fn().mockResolvedValue(mockFormData),
      } as any

      // Mock database insert operation
      const mockNewGroup = createMockGroup({
        startDate: undefined,
        endDate: undefined,
      })
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewGroup]),
        }),
      } as any)

      // Call the API
      const response = await POST(mockRequest, { params: Promise.resolve({ programId: '1' }) })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.group.startDate).toBeUndefined()
      expect(data.body.group.endDate).toBeUndefined()
    })
  })
}) 