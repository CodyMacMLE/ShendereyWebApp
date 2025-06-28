# Testing Guide

This document explains how to run tests for the SG Web application and what the tests cover.

## Setup

The project uses Jest as the testing framework with the following dependencies:

- `jest`: Testing framework
- `@testing-library/jest-dom`: Custom Jest matchers for DOM testing
- `@testing-library/react`: Testing utilities for React components
- `@types/jest`: TypeScript definitions for Jest

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### Unit Tests
Unit tests are located in `__tests__` folders next to the files they test. For example:
- `src/app/api/coach/__tests__/route.test.ts` - Tests for the coach API route

### Integration Tests
Integration tests are also in `__tests__` folders but are marked with `.integration.test.ts`:
- `src/app/api/coach/__tests__/route.integration.test.ts` - Integration tests for the coach API

### Test Utilities
Common testing utilities are located in `src/__tests__/utils/test-utils.ts`

## Test Coverage

### Coach API Route (`/api/coach`)

The coach API route tests cover:

#### Unit Tests (`route.test.ts`)
1. **Successful Data Retrieval**
   - Returns all coaches with user information
   - Proper data structure validation
   - Correct field types

2. **Empty Results**
   - Handles case when no coaches exist
   - Returns empty array with success status

3. **Error Handling**
   - Database connection errors
   - Unknown errors
   - Null/undefined errors
   - Proper error response structure

4. **Data Validation**
   - Required fields presence
   - Field type validation
   - Optional fields handling (null/undefined)

#### Integration Tests (`route.integration.test.ts`)
1. **Database Integration**
   - Actual database queries
   - Data persistence
   - Connection management

2. **Concurrent Requests**
   - Multiple simultaneous API calls
   - Thread safety
   - Connection pooling

3. **Database Failures**
   - Connection timeout handling
   - Query failure recovery

## Test Data

### Mock Data Structure
```typescript
const mockCoach = {
  id: 1,
  user: 1,
  name: 'John Doe',
  title: 'Head Coach',
  description: 'Experienced gymnastics coach',
  isSeniorStaff: true,
}
```

### Database Schema
Tests use the actual database schema from `lib/schema.ts`:
- `coaches` table
- `users` table
- Proper foreign key relationships

## Best Practices

### Mocking
- Database operations are mocked in unit tests
- Real database connections used in integration tests
- Environment variables are mocked for testing

### Test Isolation
- Each test is independent
- Database state is reset between tests
- No shared state between test cases

### Error Scenarios
- Tests cover both success and failure cases
- Edge cases are explicitly tested
- Error messages are validated

## Adding New Tests

### For New API Routes
1. Create `__tests__` folder next to the route file
2. Create `route.test.ts` for unit tests
3. Create `route.integration.test.ts` for integration tests
4. Use test utilities from `src/__tests__/utils/test-utils.ts`

### Test Naming Convention
- Test files: `*.test.ts` or `*.integration.test.ts`
- Test suites: Describe the feature being tested
- Test cases: Use descriptive names starting with "should"

### Example Test Structure
```typescript
describe('/api/feature', () => {
  describe('GET', () => {
    it('should return data successfully', async () => {
      // Test implementation
    })
    
    it('should handle errors gracefully', async () => {
      // Error test implementation
    })
  })
})
```

## Environment Setup

### Test Environment Variables
The following environment variables are set for testing:
- `DB_HOST=localhost`
- `DB_NAME=test_db`
- `DB_USER=test_user`
- `DB_PASSWORD=test_password`

### Database Setup for Integration Tests
Integration tests require a test database. You can:
1. Use a separate test database
2. Use Docker containers for isolated testing
3. Use in-memory databases for faster tests

## Troubleshooting

### Common Issues
1. **TypeScript Errors**: Ensure `@types/jest` is installed
2. **Import Errors**: Check path aliases in `tsconfig.json`
3. **Database Connection**: Verify test database is running
4. **Mock Issues**: Ensure mocks are properly configured

### Debugging Tests
- Use `console.log` in tests for debugging
- Run individual tests with `npm test -- --testNamePattern="test name"`
- Use Jest's `--verbose` flag for more output 