# Resource View Count Increment Implementation Guide

This guide explains how to implement view count increments for resources in both server and client components.

## Overview

The implementation provides two approaches:
1. **Client Component Approach**: Uses optimistic updates with API calls
2. **Server Component Approach**: Uses server actions with form submissions

## Implementation Details

### 1. API Endpoint

Created `/api/resources/[resourceId]/increment-view/route.ts` to handle view increments:

```typescript
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ resourceId: string }> }
) {
    // Increments the view count for a specific resource
    // Returns the updated resource data
}
```

### 2. Server Action

Added `incrementResourceView` to `lib/actions.ts`:

```typescript
export const incrementResourceView = async (resourceId: number) => {
    // Server action that increments view count
    // Can be used in server components
}
```

### 3. Client Component Implementation

**File**: `src/app/(public)/resources/StackedList.tsx`

**Key Features**:
- Optimistic updates for immediate UI feedback
- Error handling with rollback on failure
- API call to update database
- Opens resource in new tab

**How it works**:
1. Immediately updates local state (optimistic update)
2. Calls API to update database
3. Reverts optimistic update if API call fails
4. Opens resource in Google Docs Viewer

```typescript
const handleOpenResource = async (resource: Resource) => {
    // Optimistic update
    setLocalResources(prev => 
        prev.map(r => 
            r.id === resource.id 
                ? { ...r, views: r.views + 1 }
                : r
        )
    )

    // API call
    const response = await fetch(`/api/resources/${resource.id}/increment-view`, {
        method: 'POST',
    })

    // Error handling with rollback
    if (!response.ok) {
        // Revert optimistic update
    }
}
```

### 4. Server Component Implementation

**File**: `src/components/UI/ServerResourceList.tsx`

**Key Features**:
- Uses server actions for database updates
- Form-based submission
- Automatic page revalidation
- No client-side JavaScript required

**How it works**:
1. Uses HTML form with server action
2. Server action updates database
3. Revalidates page to show updated data
4. Opens resource in new tab

```typescript
<form action={async () => {
    'use server'
    await handleResourceView(resource.id);
}}>
    <button type="submit">Open</button>
</form>
```

## Usage Examples

### Client Component Usage

```typescript
// In a client component
const handleOpenResource = async (resource: Resource) => {
    // Optimistic update
    setResources(prev => 
        prev.map(r => 
            r.id === resource.id 
                ? { ...r, views: r.views + 1 }
                : r
        )
    )

    // API call
    const response = await fetch(`/api/resources/${resource.id}/increment-view`, {
        method: 'POST',
    })

    // Open resource
    window.open(`https://docs.google.com/viewer?url=${resource.resourceUrl}`, '_blank');
}
```

### Server Component Usage

```typescript
// In a server component
<form action={async () => {
    'use server'
    await incrementResourceView(resource.id);
    revalidatePath('/resources');
}}>
    <button type="submit">Open</button>
</form>
```

## Database Schema

The `resources` table includes a `views` column:

```sql
CREATE TABLE "resources" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text,
    "size" integer,
    "views" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "resourceUrl" text
);
```

## Benefits of Each Approach

### Client Component Approach
- ✅ Immediate UI feedback (optimistic updates)
- ✅ Better user experience
- ✅ Can handle complex client-side logic
- ❌ Requires JavaScript
- ❌ More complex error handling

### Server Component Approach
- ✅ Works without JavaScript
- ✅ Simpler implementation
- ✅ Better SEO (server-rendered)
- ✅ Automatic page revalidation
- ❌ Requires page refresh to see updates
- ❌ Less immediate feedback

## Best Practices

1. **Error Handling**: Always implement proper error handling and rollback mechanisms
2. **Optimistic Updates**: Use optimistic updates in client components for better UX
3. **Revalidation**: Use `revalidatePath()` in server components to refresh data
4. **Type Safety**: Ensure proper TypeScript types for all data structures
5. **Database Consistency**: Use database transactions when needed for data integrity

## Testing

To test the implementation:

1. **Client Component**: Open browser dev tools and check network tab for API calls
2. **Server Component**: Check database directly to verify view count increments
3. **Error Scenarios**: Test with invalid resource IDs or network failures

## Migration Notes

If you're migrating from an existing implementation:

1. Update existing resource components to use the new API endpoint
2. Replace direct database calls with the server action
3. Update any existing view count logic to use the new increment function
4. Test thoroughly to ensure no data loss during migration 