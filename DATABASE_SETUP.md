# Database Setup Guide

## Adding Profile Pictures and Project Start Dates

### Step 1: Add Columns to Database

You need to add two new columns to your `employees` table in Supabase:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this SQL script:**

```sql
-- Add profile_picture column (text/string for URL)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add project_start_date column (date type)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS project_start_date DATE;
```

Or use the provided script: `scripts/add-database-columns.sql`

### Step 2: Update Existing Employees

You can update employees in several ways:

#### Option A: Via Supabase Dashboard
1. Go to **Table Editor** → **employees**
2. Click on an employee row
3. Add:
   - `profile_picture`: URL to the image (e.g., `https://i.pravatar.cc/150?img=1`)
   - `project_start_date`: Date in format `YYYY-MM-DD` (e.g., `2024-01-15`)

#### Option B: Via API (using the update endpoint)
```bash
curl -X PUT http://localhost:3000/api/employees/[EMPLOYEE_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "profile_picture": "https://example.com/profile.jpg",
    "project_start_date": "2024-01-15"
  }'
```

#### Option C: Using the provided script
Edit `scripts/update-employee-example.js` with the employee ID and data, then run:
```bash
node scripts/update-employee-example.js
```

### Step 3: Add New Employees

When adding new employees via the form at `/add`, you can now include:
- **Profile Picture URL**: Any valid image URL
- **Project Start Date**: Date picker for when the project started

### Field Details

- **`profile_picture`** (TEXT, nullable):
  - URL to the employee's profile picture
  - Examples:
    - `https://i.pravatar.cc/150?img=1` (placeholder service)
    - `https://example.com/photos/john.jpg` (your own hosting)
    - Can be `NULL` if no picture available

- **`project_start_date`** (DATE, nullable):
  - Date when the current project/client assignment started
  - Format: `YYYY-MM-DD` (e.g., `2024-01-15`)
  - Can be `NULL` if not assigned to a project
  - The UI will automatically calculate and display duration (e.g., "3 months", "1 year, 2 months")

### Display Features

Once added, the landing page will show:
- **Profile Picture**: Circular avatar at the top of each employee card
- **Start Date**: Displayed as "Started Jan 15, 2024"
- **Duration**: Automatically calculated and shown as "(3 months)" or "(1 year, 2 months)"

### Example Data

```json
{
  "profile_picture": "https://i.pravatar.cc/150?img=12",
  "project_start_date": "2024-01-15"
}
```

This will display:
- Profile picture from the URL
- "Started Jan 15, 2024 (X months)" where X is calculated automatically



