/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { athletes, scores, users } from '@/lib/schema'
import { validateApiResponse, validateErrorResponse, validateSuccessResponse } from '@/test-utils/test-utils.helper'
import { eq } from 'drizzle-orm/sql'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

describe('/api/users/[userId]/score - Integration Tests', () => {
  let testUserId: number
  let testAthleteId: number

  beforeAll(async () => {
    // Create a test user and athlete for testing
    const [testUser] = await db.insert(users).values({
      name: 'Test Athlete',
      isActive: true,
      isAthlete: true,
    }).returning()

    testUserId = testUser.id

    const [testAthlete] = await db.insert(athletes).values({
      user: testUserId,
      level: 'Level 8',
      isActive: true,
    }).returning()

    testAthleteId = testAthlete.id
  })

  afterAll(async () => {
    // Clean up test data
    await db.delete(scores).where(eq(scores.athlete, testAthleteId))
    await db.delete(athletes).where(eq(athletes.id, testAthleteId))
    await db.delete(users).where(eq(users.id, testUserId))
  })

  beforeEach(async () => {
    // Clear scores before each test
    await db.delete(scores).where(eq(scores.athlete, testAthleteId))
  })

  describe('POST - Integration', () => {
    const createMockScoreData = (overrides: any = {}) => ({
      competitionName: 'Regional Championships',
      competitionDate: '2024-03-15',
      competitionCategory: 'Level 8',
      vaultScore: 9.2,
      barsScore: 8.8,
      beamScore: 9.0,
      floorScore: 9.1,
      overallScore: 36.1,
      ...overrides,
    })

    const createMockRequest = (userId: string, body: any) => {
      const url = `http://localhost:3000/api/users/${userId}/score`
      return new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    it('should create a score and persist it to the database', async () => {
      // Test data
      const scoreData = createMockScoreData()
      const request = createMockRequest(testUserId.toString(), scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toMatchObject({
        athlete: testAthleteId,
        competition: scoreData.competitionName,
        category: scoreData.competitionCategory,
        vault: scoreData.vaultScore,
        bars: scoreData.barsScore,
        beam: scoreData.beamScore,
        floor: scoreData.floorScore,
        overall: scoreData.overallScore,
      })
      expect(data.body.id).toBeDefined()
      expect(data.body.date).toBeDefined()

      // Verify the score was actually saved to the database
      const savedScore = await db.select().from(scores).where(eq(scores.id, data.body.id))
      expect(savedScore).toHaveLength(1)
      expect(savedScore[0]).toMatchObject({
        id: data.body.id,
        athlete: testAthleteId,
        competition: scoreData.competitionName,
        category: scoreData.competitionCategory,
        vault: scoreData.vaultScore,
        bars: scoreData.barsScore,
        beam: scoreData.beamScore,
        floor: scoreData.floorScore,
        overall: scoreData.overallScore,
      })
    })

    it('should handle missing competition date correctly', async () => {
      // Test data without competition date
      const scoreData = createMockScoreData({ competitionDate: '' })
      const request = createMockRequest(testUserId.toString(), scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body.date).toBeNull()

      // Verify the score was saved with null date
      const savedScore = await db.select().from(scores).where(eq(scores.id, data.body.id))
      expect(savedScore[0].date).toBeNull()
    })

    it('should handle invalid user ID', async () => {
      // Test data with invalid user ID
      const scoreData = createMockScoreData()
      const request = createMockRequest('999999', scoreData)

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 400)
      validateErrorResponse(data, 'Invalid user ID')

      // Verify no score was created
      const scoresCount = await db.select().from(scores).where(eq(scores.athlete, testAthleteId))
      expect(scoresCount).toHaveLength(0)
    })

    it('should handle malformed JSON gracefully', async () => {
      // Create request with malformed JSON
      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}/score`, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()

      // Verify no score was created
      const scoresCount = await db.select().from(scores).where(eq(scores.athlete, testAthleteId))
      expect(scoresCount).toHaveLength(0)
    })

    it('should create multiple scores for the same athlete', async () => {
      // Create first score
      const scoreData1 = createMockScoreData({
        competitionName: 'Regional Championships',
        competitionDate: '2024-03-15',
        overallScore: 36.1,
      })
      const request1 = createMockRequest(testUserId.toString(), scoreData1)
      const response1 = await POST(request1)
      const data1 = await response1.json()

      // Create second score
      const scoreData2 = createMockScoreData({
        competitionName: 'State Championships',
        competitionDate: '2024-04-20',
        overallScore: 36.3,
      })
      const request2 = createMockRequest(testUserId.toString(), scoreData2)
      const response2 = await POST(request2)
      const data2 = await response2.json()

      // Assertions
      validateApiResponse(response1, 200)
      validateApiResponse(response2, 200)
      expect(data1.body.id).not.toBe(data2.body.id)

      // Verify both scores were saved
      const savedScores = await db.select().from(scores).where(eq(scores.athlete, testAthleteId))
      expect(savedScores).toHaveLength(2)
      expect(savedScores.map(s => s.competition)).toContain('Regional Championships')
      expect(savedScores.map(s => s.competition)).toContain('State Championships')
    })
  })

  describe('GET - Integration', () => {
    const createMockRequest = (userId: string) => {
      return new NextRequest(`http://localhost:3000/api/users/${userId}/score`)
    }

    it('should return all scores for a user', async () => {
      // Create test scores
      const testScores = [
        {
          athlete: testAthleteId,
          competition: 'Regional Championships',
          date: new Date('2024-03-15'),
          category: 'Level 8',
          vault: 9.2,
          bars: 8.8,
          beam: 9.0,
          floor: 9.1,
          overall: 36.1,
        },
        {
          athlete: testAthleteId,
          competition: 'State Championships',
          date: new Date('2024-04-20'),
          category: 'Level 8',
          vault: 9.0,
          bars: 9.1,
          beam: 8.9,
          floor: 9.3,
          overall: 36.3,
        },
      ]

      await db.insert(scores).values(testScores)

      // Create request
      const request = createMockRequest(testUserId.toString())
      const params = Promise.resolve({ userId: testUserId.toString() })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toHaveLength(2)
      expect(data.body[0]).toMatchObject({
        athlete: testAthleteId,
        competition: 'Regional Championships',
        category: 'Level 8',
        vault: 9.2,
        bars: 8.8,
        beam: 9.0,
        floor: 9.1,
        overall: 36.1,
      })
      expect(data.body[1]).toMatchObject({
        athlete: testAthleteId,
        competition: 'State Championships',
        category: 'Level 8',
        vault: 9.0,
        bars: 9.1,
        beam: 8.9,
        floor: 9.3,
        overall: 36.3,
      })
    })

    it('should return empty array when user has no scores', async () => {
      // Create request for user with no scores
      const request = createMockRequest(testUserId.toString())
      const params = Promise.resolve({ userId: testUserId.toString() })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
      expect(data.body).toHaveLength(0)
    })

    it('should handle non-existent user ID', async () => {
      // Create request for non-existent user
      const request = createMockRequest('999999')
      const params = Promise.resolve({ userId: '999999' })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data, [])
      expect(data.body).toHaveLength(0)
    })

    it('should handle scores with null values', async () => {
      // Create test score with null values
      const testScore = {
        athlete: testAthleteId,
        competition: 'Regional Championships',
        date: null,
        category: 'Level 8',
        vault: 9.2,
        bars: null,
        beam: 9.0,
        floor: 9.1,
        overall: 36.1,
      }

      await db.insert(scores).values(testScore)

      // Create request
      const request = createMockRequest(testUserId.toString())
      const params = Promise.resolve({ userId: testUserId.toString() })

      // Call the API
      const response = await GET(request, { params })
      const data = await response.json()

      // Assertions
      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.body).toHaveLength(1)
      expect(data.body[0]).toMatchObject({
        athlete: testAthleteId,
        competition: 'Regional Championships',
        category: 'Level 8',
        vault: 9.2,
        beam: 9.0,
        floor: 9.1,
        overall: 36.1,
      })
      expect(data.body[0].date).toBeNull()
      expect(data.body[0].bars).toBeNull()
    })
  })
}) 