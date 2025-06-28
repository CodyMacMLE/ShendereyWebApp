/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { achievements, alumni, athletes, coaches, media, prospects, scores, userImages, users } from '@/lib/schema'
import { validateApiResponse, validateSuccessResponse } from '@/test-utils/test-utils.helper'
import { eq } from 'drizzle-orm/sql'
import { NextRequest } from 'next/server'
import { DELETE, GET, PUT } from '../route'

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

describe('/api/users/[userId] Integration Tests', () => {
  let testUserId: number
  let testAthleteId: number
  let testCoachId: number

  beforeAll(async () => {
    // Create test user
    const [userResult] = await db.insert(users).values({
      name: 'Integration Test User',
      isActive: true,
      isAthlete: false,
      isAlumni: false,
      isProspect: false,
      isCoach: true,
      isScouted: false,
    }).returning()
    testUserId = userResult.id

    // Create test coach
    const [coachResult] = await db.insert(coaches).values({
      user: testUserId,
      title: 'Test Coach',
      description: 'Integration test coach',
      isSeniorStaff: false,
    }).returning()
    testCoachId = coachResult.id

    // Create test user images
    await db.insert(userImages).values({
      user: testUserId,
      staffUrl: 'https://test-bucket.s3.amazonaws.com/test-staff.jpg',
      athleteUrl: null,
      prospectUrl: null,
      alumniUrl: null,
    })
  })

  afterAll(async () => {
    // Clean up test data
    await db.delete(userImages).where(eq(userImages.user, testUserId))
    await db.delete(coaches).where(eq(coaches.user, testUserId))
    await db.delete(users).where(eq(users.id, testUserId))
  })

  describe('GET Integration', () => {
    it('should retrieve user data with coach information', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}`)
      const response = await GET(request, { params: Promise.resolve({ userId: testUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      
      expect(data.body).toMatchObject({
        id: testUserId,
        name: 'Integration Test User',
        isCoach: true,
        isAthlete: false,
        images: {
          staffUrl: 'https://test-bucket.s3.amazonaws.com/test-staff.jpg',
          athleteUrl: null,
          prospectUrl: null,
          alumniUrl: null,
        },
        coach: {
          id: testCoachId,
          title: 'Test Coach',
          description: 'Integration test coach',
          isSeniorStaff: false,
        },
      })
    })

    it('should handle non-existent user gracefully', async () => {
      const nonExistentId = 99999
      const request = new NextRequest(`http://localhost:3000/api/users/${nonExistentId}`)
      const response = await GET(request, { params: Promise.resolve({ userId: nonExistentId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      expect(data.body).toBeUndefined()
    })
  })

  describe('PUT Integration', () => {
    it('should update user information successfully', async () => {
      const formData = new FormData()
      formData.append('name', 'Updated Integration User')
      formData.append('isCoach', 'true')
      formData.append('isAthlete', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'true')
      formData.append('coachTitle', 'Senior Coach')
      formData.append('coachDescription', 'Updated coach description')

      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}`, {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId: testUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe(`/admin/users/${testUserId}`)

      // Verify the update in database
      const updatedUser = await db.select().from(users).where(eq(users.id, testUserId))
      const updatedCoach = await db.select().from(coaches).where(eq(coaches.user, testUserId))
      
      expect(updatedUser[0].name).toBe('Updated Integration User')
      expect(updatedCoach[0].title).toBe('Senior Coach')
      expect(updatedCoach[0].description).toBe('Updated coach description')
      expect(updatedCoach[0].isSeniorStaff).toBe(true)
    })

    it('should update user to become an athlete', async () => {
      const formData = new FormData()
      formData.append('name', 'Updated Integration User')
      formData.append('isCoach', 'true')
      formData.append('isAthlete', 'true')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'true')
      formData.append('coachTitle', 'Senior Coach')
      formData.append('coachDescription', 'Updated coach description')
      formData.append('athleteLevel', 'Elite')

      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}`, {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId: testUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)

      // Verify athlete was created
      const athlete = await db.select().from(athletes).where(eq(athletes.user, testUserId))
      expect(athlete).toHaveLength(1)
      expect(athlete[0].level).toBe('Elite')
    })

    it('should update user to become a prospect', async () => {
      const formData = new FormData()
      formData.append('name', 'Updated Integration User')
      formData.append('isCoach', 'true')
      formData.append('isAthlete', 'true')
      formData.append('isProspect', 'true')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'true')
      formData.append('coachTitle', 'Senior Coach')
      formData.append('coachDescription', 'Updated coach description')
      formData.append('athleteLevel', 'Elite')
      formData.append('prospectMajor', 'Computer Science')
      formData.append('prospectGPA', '3.9')
      formData.append('prospectInstitution', 'MIT')
      formData.append('prospectGraduationYear', '2026')
      formData.append('prospectDescription', 'Top prospect')
      formData.append('prospectYoutube', 'https://youtube.com/prospect')
      formData.append('prospectInstagram', 'https://instagram.com/prospect')

      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}`, {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId: testUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)

      // Verify prospect was created
      const prospect = await db.select().from(prospects).where(eq(prospects.user, testUserId))
      expect(prospect).toHaveLength(1)
      expect(prospect[0].major).toBe('Computer Science')
      expect(prospect[0].gpa).toBe(3.9)
      expect(prospect[0].institution).toBe('MIT')
    })

    it('should update user to become an alumni', async () => {
      const formData = new FormData()
      formData.append('name', 'Updated Integration User')
      formData.append('isCoach', 'true')
      formData.append('isAthlete', 'true')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'true')
      formData.append('isSeniorStaff', 'true')
      formData.append('coachTitle', 'Senior Coach')
      formData.append('coachDescription', 'Updated coach description')
      formData.append('athleteLevel', 'Elite')
      formData.append('alumniSchool', 'Stanford University')
      formData.append('alumniGraduationYear', '2020')
      formData.append('alumniDescription', 'Successful graduate')

      const request = new NextRequest(`http://localhost:3000/api/users/${testUserId}`, {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ userId: testUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)

      // Verify alumni was created
      const alumniRecord = await db.select().from(alumni).where(eq(alumni.user, testUserId))
      expect(alumniRecord).toHaveLength(1)
      expect(alumniRecord[0].school).toBe('Stanford University')
      expect(alumniRecord[0].description).toBe('Successful graduate')
    })
  })

  describe('DELETE Integration', () => {
    let deleteTestUserId: number
    let deleteTestAthleteId: number

    beforeAll(async () => {
      // Create test user for deletion
      const [userResult] = await db.insert(users).values({
        name: 'Delete Test User',
        isActive: true,
        isAthlete: true,
        isAlumni: false,
        isProspect: false,
        isCoach: false,
        isScouted: false,
      }).returning()
      deleteTestUserId = userResult.id

      // Create test athlete
      const [athleteResult] = await db.insert(athletes).values({
        user: deleteTestUserId,
        level: 'Advanced',
      }).returning()
      deleteTestAthleteId = athleteResult.id

      // Create test media
      await db.insert(media).values({
        athlete: deleteTestAthleteId,
        mediaUrl: 'https://test-bucket.s3.amazonaws.com/test-media.mp4',
        mediaType: 'video',
        name: 'Test Media',
        description: 'Test media description',
      })

      // Create test scores
      await db.insert(scores).values({
        athlete: deleteTestAthleteId,
        overall: 9.5,
        competition: 'Test Competition',
        date: new Date(),
      })

      // Create test achievements
      await db.insert(achievements).values({
        athlete: deleteTestAthleteId,
        title: 'Test Achievement',
        description: 'Test achievement description',
        date: new Date(),
      })

      // Create test user images
      await db.insert(userImages).values({
        user: deleteTestUserId,
        staffUrl: null,
        athleteUrl: 'https://test-bucket.s3.amazonaws.com/test-athlete.jpg',
        prospectUrl: null,
        alumniUrl: null,
      })
    })

    it('should delete user and all related data successfully', async () => {
      const request = new NextRequest(`http://localhost:3000/api/users/${deleteTestUserId}`, {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ userId: deleteTestUserId.toString() }) })
      const data = await response.json()

      validateApiResponse(response, 200)
      validateSuccessResponse(data)
      expect(data.redirect).toBe('/admin/users')

      // Verify all related data was deleted
      const remainingUser = await db.select().from(users).where(eq(users.id, deleteTestUserId))
      const remainingAthlete = await db.select().from(athletes).where(eq(athletes.id, deleteTestAthleteId))
      const remainingMedia = await db.select().from(media).where(eq(media.athlete, deleteTestAthleteId))
      const remainingScores = await db.select().from(scores).where(eq(scores.athlete, deleteTestAthleteId))
      const remainingAchievements = await db.select().from(achievements).where(eq(achievements.athlete, deleteTestAthleteId))
      const remainingImages = await db.select().from(userImages).where(eq(userImages.user, deleteTestUserId))

      expect(remainingUser).toHaveLength(0)
      expect(remainingAthlete).toHaveLength(0)
      expect(remainingMedia).toHaveLength(0)
      expect(remainingScores).toHaveLength(0)
      expect(remainingAchievements).toHaveLength(0)
      expect(remainingImages).toHaveLength(0)
    })
  })
}) 