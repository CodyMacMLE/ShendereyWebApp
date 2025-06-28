// Helper function to create mock coach data
export const createMockCoach = (overrides: Partial<any> = {}) => ({
  id: 1,
  user: 1,
  name: 'John Doe',
  title: 'Head Coach',
  description: 'Experienced gymnastics coach',
  isSeniorStaff: true,
  ...overrides,
})

// Helper function to create mock user data
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'John Doe',
  isActive: true,
  isAthlete: false,
  isAlumni: false,
  isProspect: false,
  isCoach: true,
  isScouted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper function to mock database query chain
export const mockDbQueryChain = (returnValue: any) => {
  return jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockResolvedValue(returnValue),
    }),
  })
}

// Helper function to mock database query chain with error
export const mockDbQueryChainWithError = (error: any) => {
  return jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockRejectedValue(error),
    }),
  })
}

// Helper function to validate API response structure
export const validateApiResponse = (response: any, expectedStatus: number) => {
  expect(response).toBeDefined()
  expect(response.status).toBe(expectedStatus)
}

// Helper function to validate success response
export const validateSuccessResponse = (data: any, expectedBody?: any) => {
  expect(data.success).toBe(true)
  if (expectedBody) {
    expect(data.body).toEqual(expectedBody)
  }
}

// Helper function to validate error response
export const validateErrorResponse = (data: any, expectedError?: string) => {
  expect(data.success).toBe(false)
  expect(data.error).toBeDefined()
  if (expectedError) {
    expect(data.error).toBe(expectedError)
  }
}

// Helper function to validate coach data structure
export const validateCoachDataStructure = (coach: any) => {
  expect(coach).toHaveProperty('id')
  expect(coach).toHaveProperty('user')
  expect(coach).toHaveProperty('name')
  expect(coach).toHaveProperty('title')
  expect(coach).toHaveProperty('description')
  expect(coach).toHaveProperty('isSeniorStaff')
  
  expect(typeof coach.id).toBe('number')
  expect(typeof coach.user).toBe('number')
  expect(typeof coach.name).toBe('string')
  expect(typeof coach.title).toBe('string')
  expect(typeof coach.description).toBe('string')
  expect(typeof coach.isSeniorStaff).toBe('boolean')
} 