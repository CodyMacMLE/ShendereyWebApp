/**
 * @jest-environment node
 */

import { db } from '@/lib/db'
import { alumni, athletes, coaches, prospects, userImages, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

describe('/api/users Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(userImages)
    await db.delete(coaches)
    await db.delete(athletes)
    await db.delete(prospects)
    await db.delete(alumni)
    await db.delete(users)
  })

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(userImages)
    await db.delete(coaches)
    await db.delete(athletes)
    await db.delete(prospects)
    await db.delete(alumni)
    await db.delete(users)
  })

  describe('GET', () => {
    it('should return empty array when no users exist', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })

    it('should return users with their images', async () => {
      // Create test user
      const [user] = await db.insert(users).values({
        name: 'Test User',
        isActive: true,
        isAthlete: false,
        isCoach: true,
        isProspect: false,
        isAlumni: false,
        isScouted: false,
      }).returning()

      // Create test user images
      await db.insert(userImages).values({
        user: user.id,
        staffUrl: 'https://example.com/staff.jpg',
        athleteUrl: null,
        prospectUrl: null,
        alumniUrl: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].name).toBe('Test User')
      expect(data.data[0].images.staffUrl).toBe('https://example.com/staff.jpg')
    })

    it('should return users with null images when no images exist', async () => {
      // Create test user without images
      await db.insert(users).values({
        name: 'Test User',
        isActive: true,
        isAthlete: false,
        isCoach: false,
        isProspect: false,
        isAlumni: false,
        isScouted: false,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].images).toBeNull()
    })
  })

  describe('POST', () => {
    it('should create a basic user successfully', async () => {
      const formData = new FormData()
      formData.append('name', 'Basic User')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.redirect).toMatch(/\/admin\/users\/\d+/)

      // Verify user was created in database
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Basic User'))
      expect(createdUsers).toHaveLength(1)
      expect(createdUsers[0].isActive).toBe(true)
    })

    it('should create a coach user with all related data', async () => {
      const formData = new FormData()
      formData.append('name', 'Coach User')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'true')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'true')
      formData.append('coachTitle', 'Head Coach')
      formData.append('coachDescription', 'Experienced gymnastics coach')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify user was created
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Coach User'))
      expect(createdUsers).toHaveLength(1)
      expect(createdUsers[0].isCoach).toBe(true)

      // Verify coach data was created
      const createdCoaches = await db.select().from(coaches).where(eq(coaches.user, createdUsers[0].id))
      expect(createdCoaches).toHaveLength(1)
      expect(createdCoaches[0].title).toBe('Head Coach')
      expect(createdCoaches[0].isSeniorStaff).toBe(true)
    })

    it('should create an athlete user with athlete data', async () => {
      const formData = new FormData()
      formData.append('name', 'Athlete User')
      formData.append('isAthlete', 'true')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')
      formData.append('athleteLevel', 'Advanced')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify user was created
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Athlete User'))
      expect(createdUsers).toHaveLength(1)
      expect(createdUsers[0].isAthlete).toBe(true)

      // Verify athlete data was created
      const createdAthletes = await db.select().from(athletes).where(eq(athletes.user, createdUsers[0].id))
      expect(createdAthletes).toHaveLength(1)
      expect(createdAthletes[0].level).toBe('Advanced')
    })

    it('should create a prospect user with prospect data', async () => {
      const formData = new FormData()
      formData.append('name', 'Prospect User')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'true')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')
      formData.append('prospectMajor', 'Computer Science')
      formData.append('prospectGPA', '3.8')
      formData.append('prospectInstitution', 'University of Test')
      formData.append('prospectGraduationYear', '2025-06-01')
      formData.append('prospectDescription', 'Promising prospect')
      formData.append('prospectYoutube', 'https://youtube.com/prospect')
      formData.append('prospectInstagram', 'https://instagram.com/prospect')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify user was created
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Prospect User'))
      expect(createdUsers).toHaveLength(1)
      expect(createdUsers[0].isProspect).toBe(true)

      // Verify prospect data was created
      const createdProspects = await db.select().from(prospects).where(eq(prospects.user, createdUsers[0].id))
      expect(createdProspects).toHaveLength(1)
      expect(createdProspects[0].major).toBe('Computer Science')
      expect(createdProspects[0].gpa).toBe(3.8)
      expect(createdProspects[0].institution).toBe('University of Test')
    })

    it('should create an alumni user with alumni data', async () => {
      const formData = new FormData()
      formData.append('name', 'Alumni User')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'true')
      formData.append('isSeniorStaff', 'false')
      formData.append('alumniSchool', 'Test University')
      formData.append('alumniGraduationYear', '2020-06-01')
      formData.append('alumniDescription', 'Successful graduate')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify user was created
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Alumni User'))
      expect(createdUsers).toHaveLength(1)
      expect(createdUsers[0].isAlumni).toBe(true)

      // Verify alumni data was created
      const createdAlumni = await db.select().from(alumni).where(eq(alumni.user, createdUsers[0].id))
      expect(createdAlumni).toHaveLength(1)
      expect(createdAlumni[0].school).toBe('Test University')
      expect(createdAlumni[0].description).toBe('Successful graduate')
    })

    it('should handle prospect with null GPA and graduation year', async () => {
      const formData = new FormData()
      formData.append('name', 'Prospect User')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'true')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')
      formData.append('prospectMajor', 'Engineering')
      // No GPA or graduation year

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify prospect data was created with null values
      const createdUsers = await db.select().from(users).where(eq(users.name, 'Prospect User'))
      const createdProspects = await db.select().from(prospects).where(eq(prospects.user, createdUsers[0].id))
      expect(createdProspects[0].gpa).toBeNull()
      expect(createdProspects[0].graduationYear).toBeNull()
    })

    it('should create user images record', async () => {
      const formData = new FormData()
      formData.append('name', 'User With Images')
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify user images record was created
      const createdUsers = await db.select().from(users).where(eq(users.name, 'User With Images'))
      const createdImages = await db.select().from(userImages).where(eq(userImages.user, createdUsers[0].id))
      expect(createdImages).toHaveLength(1)
      expect(createdImages[0].staffUrl).toBeNull()
      expect(createdImages[0].athleteUrl).toBeNull()
      expect(createdImages[0].prospectUrl).toBeNull()
      expect(createdImages[0].alumniUrl).toBeNull()
    })

    it('should handle missing required name field', async () => {
      const formData = new FormData()
      formData.append('isAthlete', 'false')
      formData.append('isCoach', 'false')
      formData.append('isProspect', 'false')
      formData.append('isAlumni', 'false')
      formData.append('isSeniorStaff', 'false')
      // Missing name field

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
}) 