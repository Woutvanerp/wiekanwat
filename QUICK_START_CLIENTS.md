# Quick Start: Client Hierarchy Feature

## 🚀 Getting Started in 3 Steps

### Step 1: Create the Database Table

Go to your **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Copy and paste the contents of scripts/create-clients-table.sql
-- Or run this directly:

CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requested_positions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing clients from employees table
INSERT INTO clients (name, description, requested_positions)
SELECT DISTINCT 
  current_client as name,
  '' as description,
  '[]'::jsonb as requested_positions
FROM employees 
WHERE current_client IS NOT NULL 
  AND current_client != ''
ON CONFLICT (name) DO NOTHING;
```

### Step 2: Add Example Clients

Make sure your dev server is running, then:

```bash
node scripts/add-example-clients.js
```

This adds 5 example clients with position requests (ASML, Philips, VDL, DAF Trucks, Thales).

### Step 3: View Your Clients

Navigate to: **http://localhost:3000/clients**

You should now see:
- ✅ Client cards with position requests
- 📊 Progress bars showing filled vs requested positions
- 👥 Assigned employees grouped by client
- 🟢 Available employees section

## What You'll See

### Client Card Example

```
┌─────────────────────────────────────────────────┐
│ 🏢 ASML                     [Vraagt om personeel]│
│ Semiconductor manufacturing technology           │
│                                         5 / 8    │
│                                       Personen   │
├─────────────────────────────────────────────────┤
│ Gevraagde Posities:                             │
│                                                 │
│ Senior Consultant              2 / 2 personen  │
│ ████████████████████████████████████ 100%      │
│ [John Doe] [Jane Smith]                        │
│                                                 │
│ Consultant                     3 / 3 personen  │
│ ████████████████████████████████████ 100%      │
│ [Bob Johnson] [Alice Brown] [Charlie Davis]    │
│                                                 │
│ Werkstudent                    0 / 1 persoon   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Adding Position Requests to a Client

### Via API (Postman, curl, or browser console):

```javascript
// Update ASML's position requests
fetch('/api/clients/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestedPositions: [
      { hierarchy: 'Senior Consultant', count: 2 },
      { hierarchy: 'Consultant', count: 3 },
      { hierarchy: 'Werkstudent', count: 1 }
    ]
  })
})
```

### Via Supabase Dashboard:

1. Go to **Table Editor** → **clients**
2. Find the client row
3. Edit the `requested_positions` column:

```json
[
  {"hierarchy": "Senior Consultant", "count": 2},
  {"hierarchy": "Consultant", "count": 3},
  {"hierarchy": "Werkstudent", "count": 1}
]
```

## Assigning Employees to Clients

Go to the employee profile page and set their `currentClient` field to match a client name, or update via API:

```javascript
fetch('/api/employees/[employee-id]', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    current_client: 'ASML'  // Must match client name exactly
  })
})
```

## Hierarchy Levels Available

- Boss
- Managing Director
- Managing Consultant
- Principal Consultant
- Senior Consultant
- Consultant
- Werkstudent

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green border | Client is fully staffed |
| 🟠 Orange border | Client has unfulfilled requests |
| "Volledig bezet" badge | All positions filled |
| "Vraagt om personeel" badge | Needs more staff |
| Progress bars | Fill percentage for each position |

## Troubleshooting

**No clients showing?**
- Did you run the SQL script to create the table?
- Check Supabase environment variables in `.env.local`

**Employee not appearing under client?**
- Ensure `currentClient` exactly matches the client name (case-sensitive)
- Refresh the page

**Want to add more clients?**
- Use the API endpoint: `POST /api/clients`
- Or insert directly in Supabase Table Editor

## Next Steps

📖 Read the full documentation: `CLIENTS_FEATURE.md`

🔧 Customize example clients: Edit `scripts/add-example-clients.js`

🎨 Adjust the UI: Edit `app/clients/page.js`

📊 Add more features: Create client management forms, drag-and-drop assignments, etc.

