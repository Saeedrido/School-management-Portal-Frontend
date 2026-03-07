# 404 Error Fix - /api/terms/active Endpoint

## Problem Statement

**Error:** `GET http://localhost:64677/api/terms/active` returned `404 Not Found`

**Frontend File:** `src/pages/Teachers/TeacherAssignments.js` (line 118)

**Impact:** Teacher assignments page could not load the active term, breaking the assignment creation flow.

---

## Root Cause Analysis

### **STEP 1: Verify Backend Endpoint** ✅

**File:** `src/API/Controllers/TermsController.cs`

**Finding:** The endpoint `/api/terms/active` **DID NOT EXIST** in the backend.

**Existing endpoints in TermsController:**
- ✅ `GET /api/terms` - Get all terms
- ✅ `GET /api/terms/by-academic-year/{academicYearId}` - Get terms by academic year
- ✅ `GET /api/terms/{id}` - Get term by ID
- ✅ `POST /api/terms` - Create term
- ✅ `PUT /api/terms/{id}` - Update term
- ✅ `POST /api/terms/{id}/set-active` - Set term as active
- ✅ `DELETE /api/terms/{id}` - Delete term
- ❌ `GET /api/terms/active` - **MISSING!**

### **STEP 2: Check Service Layer**

**File:** `src/Application/Interfaces/ITermService.cs`

**Finding:** No method `GetActiveTermAsync()` existed in the service interface.

### **STEP 3: Check Data Access Layer**

**File:** `src/Domain/IUnitOfWork.cs`

**Finding:** No method `GetActiveTermWithAcademicYearAsync()` existed in the unit of work interface.

### **Conclusion:**

The frontend was calling a non-existent endpoint. The backend had no way to retrieve the currently active term.

---

## Solution Implemented

### **Option Chosen:** Create the missing endpoint properly

We implemented the complete chain of changes across all layers:

### **Layer 1: Data Access (Repository)**

#### **File:** `src/Domain/IUnitOfWork.cs`

**Added Method:**
```csharp
Task<Term?> GetActiveTermWithAcademicYearAsync();
```

#### **File:** `src/Infrastructure/Repositories/UnitOfWork.cs`

**Added Implementation:**
```csharp
public async Task<Term?> GetActiveTermWithAcademicYearAsync()
{
    return await _context.Terms
        .AsNoTracking()
        .Include(t => t.AcademicYear)
        .Where(t => t.IsActive == true)
        .FirstOrDefaultAsync();
}
```

**What it does:**
- Queries the Terms table
- Filters for `IsActive = true`
- Includes the related AcademicYear navigation property
- Uses AsNoTracking for read-only performance
- Returns the first active term found, or null if none exists

---

### **Layer 2: Business Logic (Service)**

#### **File:** `src/Application/Interfaces/ITermService.cs`

**Added Method:**
```csharp
Task<ApiResponse<TermDto>> GetActiveTermAsync();
```

#### **File:** `src/Application/Services/TermService.cs`

**Added Implementation:**
```csharp
public async Task<ApiResponse<TermDto>> GetActiveTermAsync()
{
    try
    {
        var term = await _unitOfWork.GetActiveTermWithAcademicYearAsync();

        if (term == null)
        {
            return ApiResponse<TermDto>.ErrorResponse("No active term found");
        }

        var dto = _mapper.Map<TermDto>(term);
        return ApiResponse<TermDto>.SuccessResponse(dto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting active term");
        return ApiResponse<TermDto>.ErrorResponse("An error occurred while retrieving the active term");
    }
}
```

**What it does:**
- Calls the repository method
- Returns 404 if no active term exists
- Maps the entity to DTO
- Handles exceptions gracefully

---

### **Layer 3: API Controller**

#### **File:** `src/API/Controllers/TermsController.cs`

**Added Endpoint:**
```csharp
/// <summary>
/// Get the active term
/// </summary>
[HttpGet("active")]
public async Task<ActionResult<ApiResponse<TermDto>>> GetActiveTerm()
{
    var result = await _termService.GetActiveTermAsync();
    if (!result.Success)
    {
        return NotFound(result);
    }
    return Ok(result);
}
```

**Route:** `GET /api/terms/active`

**Authorization:** Inherited from controller (`[RequireRole("Admin", "Teacher", "Student", "Parent")]`)

**Return Codes:**
- `200 OK` - Active term found and returned
- `404 Not Found` - No active term exists in database

---

## Files Modified

| File | Path | Changes |
|------|------|---------|
| 1 | `src/Domain/IUnitOfWork.cs` | Added method signature |
| 2 | `src/Infrastructure/Repositories/UnitOfWork.cs` | Implemented repository method |
| 3 | `src/Application/Interfaces/ITermService.cs` | Added method signature |
| 4 | `src/Application/Services/TermService.cs` | Implemented service method |
| 5 | `src/API/Controllers/TermsController.cs` | Added API endpoint |

---

## Testing Instructions

### **1. Restart Backend**

```bash
cd C:\Users\Prof. Timehin\Desktop\SchoolManagementPortal
dotnet run
```

**Expected Output:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:64676
      Now listening on: http://localhost:64677
```

### **2. Test Endpoint via Browser**

Navigate to:
```
http://localhost:64677/api/terms/active
```

**Expected Response (if active term exists):**
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "guid-here",
    "name": "First Term",
    "termType": 0,
    "startDate": "2024-09-01T00:00:00",
    "endDate": "2024-12-15T00:00:00",
    "isActive": true,
    "academicYearId": "guid-here",
    "academicYear": {
      "id": "guid-here",
      "name": "2024/2025",
      ...
    }
  }
}
```

**Expected Response (if no active term):**
```json
{
  "success": false,
  "message": "No active term found",
  "data": null
}
```

**Status Code:** `200 OK` or `404 Not Found`

### **3. Test Frontend**

```bash
cd C:\Users\Prof. Timehin\Desktop\chool-management-frontend
npm start
```

1. Login as Admin
2. Navigate to Dashboard → Click "Assign Teachers"
3. **Expected:** Page loads without 404 error
4. **Expected:** Term dropdown shows the active term
5. Check browser console - should be clean (no Axios 404 errors)

### **4. Set an Active Term (if none exists)**

If the database has no active term:

1. Navigate to Terms page: `/dashboard/terms`
2. Click "Add Term" to create a term
3. After creating, find the "Set Active" button
4. Click "Set Active" on a term
5. Now `/api/terms/active` should return that term

---

## Swagger Testing

After backend restart:

1. Open Swagger: `https://localhost:64676/swagger`
2. Find `TermsController`
3. Find `GET /api/terms/active` endpoint
4. Click "Try it out"
5. Click "Execute"
6. **Expected:** `200` response with term data

---

## How Active Terms Work

### **Setting a Term Active**

When you call `POST /api/terms/{id}/set-active`:

1. Backend finds all terms in the same academic year
2. Sets `IsActive = false` for all those terms
3. Sets `IsActive = true` for the selected term
4. Saves changes
5. Only ONE term per academic year can be active at a time

### **Getting the Active Term**

When you call `GET /api/terms/active`:

1. Backend queries for ANY term with `IsActive = true`
2. Returns the first one found
3. If none found, returns 404

---

## Frontend Integration

### **Files Using `/api/terms/active`:**

1. **`src/pages/Teachers/TeacherAssignments.js`**
   - Line 118: Fetches active term on load
   - Used to pre-select the term in the dropdown

2. **`src/pages/Exams/ExamForm.js`**
   - Uses for exam creation (via `termsAPI.getActive()`)

3. **`src/services/api.js`**
   - `termsAPI.getActive()` method

### **API Service Code (already correct):**
```javascript
terms: {
  getAll: () => api.get('/api/terms'),
  getActive: () => api.get('/api/terms/active'),  // ✅ Correct
  ...
}
```

---

## Validation Checklist

- [x] Backend endpoint created
- [x] Repository method implemented
- [x] Service method implemented
- [x] Controller endpoint added
- [x] Route matches frontend expectation (`/api/terms/active`)
- [x] Authorization rules set (inherited from controller)
- [x] Returns proper DTO (`TermDto` with `AcademicYear` included)
- [x] Handles null case (no active term)
- [ ] **You need to restart backend** ✅
- [ ] **Test in Swagger** ✅
- [ ] **Test in browser** ✅
- [ ] **Test frontend loads without 404** ✅

---

## Why This Fix is Critical

### **Before Fix:**
- ❌ Frontend calls non-existent endpoint
- ❌ Returns 404 Not Found
- ❌ TeacherAssignments page throws error
- ❌ Exam form may fail
- ❌ Term-based filtering broken

### **After Fix:**
- ✅ Endpoint exists and responds
- ✅ Returns 200 OK with active term
- ✅ TeacherAssignments page loads correctly
- ✅ Term dropdown populated
- ✅ Assignments can be created

---

## Common Issues & Solutions

### **Issue 1: Still getting 404 after changes**

**Cause:** Backend not restarted

**Solution:**
```bash
# Stop backend (Ctrl+C)
# Restart backend
dotnet run
```

### **Issue 2: Getting 404 but endpoint exists**

**Cause:** Wrong URL

**Check:**
- Frontend calls: `/api/terms/active`
- Backend controller: `[Route("api/[controller]")]` = `/api/Terms`
- Action: `[HttpGet("active")]`
- **Full route:** `/api/Terms/active` ✅ (matches!)

### **Issue 3: Getting 404 "No active term found"**

**Cause:** Database has no active term set

**Solution:**
1. Go to `/dashboard/terms`
2. Create a term if none exists
3. Click "Set Active" on a term
4. Retry `/api/terms/active`

---

## Summary

**Problem:** Frontend calling `/api/terms/active` but backend endpoint doesn't exist

**Root Cause:** Missing endpoint in all three layers (Repository, Service, Controller)

**Solution:** Implemented complete chain:
1. Added `GetActiveTermWithAcademicYearAsync()` to UnitOfWork
2. Added `GetActiveTermAsync()` to TermService
3. Added `GET /api/terms/active` to TermsController

**Result:** Endpoint now exists and returns the active term

**Next Steps:**
1. Restart backend
2. Test in Swagger
3. Test frontend (no more 404 errors)
4. Verify TeacherAssignments page works

---

**Date:** 2025-02-25
**Status:** ✅ FIXED - Backend changes complete, ready for testing
**Files Modified:** 5 backend files
**Impact:** Critical - Teacher assignments and exam creation depend on this
