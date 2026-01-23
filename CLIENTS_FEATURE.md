# Clients with Hierarchy Feature

This feature adds a comprehensive client management system with hierarchy-based position requests to your employee tracking application.

## Overview

The Clients feature allows you to:
- **Track client companies** and their position requests
- **See which roles/hierarchy levels** each client is requesting
- **Monitor staffing status** - how many positions are filled vs requested
- **View assigned employees** for each client by hierarchy level
- **Identify unfulfilled requests** with visual indicators

## Database Setup

### Step 1: Create the Clients Table

Run the SQL script in your Supabase SQL Editor:

```bash
scripts/create-clients-table.sql
```

This will:
- Create a `clients` table with fields for name, description, and requested positions
- Migrate existing client names from the `employees` table
- Set up proper indexes and constraints

### Step 2: Add Example Clients (Optional)

To populate the database with example clients:

1. Make sure your Next.js dev server is running:
   ```bash
   npm run dev
   ```

2. Run the example clients script:
   ```bash
   node scripts/add-example-clients.js
   ```

This adds 5 example clients (ASML, Philips, VDL, DAF Trucks, Thales) with various position requests.

## Data Structure

### Client Object

```javascript
{
  id: 123,                    // Auto-generated ID
  name: "ASML",              // Client company name (unique)
  description: "...",        // Optional description
  requestedPositions: [      // Array of position requests
    {
      hierarchy: "Senior Consultant",  // Role from organizational chart
      count: 2                         // Number of people needed
    },
    {
      hierarchy: "Consultant",
      count: 3
    }
  ],
  createdAt: "2024-01-01T...",
  updatedAt: "2024-01-01T..."
}
```

### Hierarchy Levels

The system uses the same hierarchy levels as the organizational chart:
- Boss
- Managing Director
- Managing Consultant
- Principal Consultant
- Senior Consultant
- Consultant
- Werkstudent

## Features in the UI

### Client Cards

Each client card shows:

1. **Header Information**
   - Client name and icon
   - Description
   - Status badge ("Volledig bezet" or "Vraagt om personeel")
   - Staff count (e.g., "5 / 7 Personen")

2. **Requested Positions** (when expanded)
   - Each hierarchy level requested
   - Progress bar showing filled vs total positions
   - Names of assigned employees for each role
   - Visual indication of fulfillment status

3. **Assigned Employees** (when expanded)
   - Grid of employee cards
   - Shows all employees currently assigned to the client
   - Clickable links to employee profiles

### Visual Indicators

- **Green border**: Client is fully staffed
- **Orange border**: Client has unfulfilled position requests
- **Progress bars**: Show fill percentage for each position type
- **Color-coded badges**: Quick status identification

### Available Employees Section

At the bottom of the page, see all employees who are:
- Not currently assigned to any client
- Available for new assignments
- Organized by their hierarchy level

## API Endpoints

### Get All Clients
```
GET /api/clients
```

Returns all clients with their requested positions.

### Get Single Client
```
GET /api/clients/[id]
```

Returns a specific client by ID.

### Create Client
```
POST /api/clients
Body: {
  name: "Company Name",
  description: "Optional description",
  requestedPositions: [
    { hierarchy: "Senior Consultant", count: 2 }
  ]
}
```

### Update Client
```
PUT /api/clients/[id]
Body: {
  name: "Updated Name",           // optional
  description: "New description", // optional
  requestedPositions: [...]       // optional
}
```

### Delete Client
```
DELETE /api/clients/[id]
```

## Usage Examples

### Adding a New Client via API

```javascript
const response = await fetch('/api/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Tech Company',
    description: 'Software development and consulting',
    requestedPositions: [
      { hierarchy: 'Principal Consultant', count: 1 },
      { hierarchy: 'Senior Consultant', count: 3 },
      { hierarchy: 'Consultant', count: 5 }
    ]
  })
})
```

### Updating Position Requests

```javascript
const response = await fetch('/api/clients/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestedPositions: [
      { hierarchy: 'Senior Consultant', count: 4 },  // Increased from 2 to 4
      { hierarchy: 'Consultant', count: 3 }
    ]
  })
})
```

## How It Works

### Automatic Staff Matching

The system automatically:
1. Reads all employees from the database
2. Groups them by their `current_client` field
3. Counts employees by hierarchy level for each client
4. Compares actual assignments to requested positions
5. Calculates fill percentages and staffing status

### Status Calculation

- **Fully Staffed**: Total assigned employees ≥ total requested positions
- **Requesting Staff**: Total assigned < total requested
- **Progress Percentage**: (Filled / Requested) × 100 for each hierarchy level

## Integration with Employees

### Assigning Employees to Clients

When you create or edit an employee, set their `currentClient` field to match a client name:

```javascript
await updateEmployee(employeeId, {
  currentClient: 'ASML'  // Must match exactly with client name
})
```

The clients page will automatically:
- Show this employee under the ASML client card
- Update the fill count for their hierarchy level
- Update progress bars and status indicators

### Removing Employee Assignments

Set `currentClient` to `null` to make an employee available:

```javascript
await updateEmployee(employeeId, {
  currentClient: null
})
```

The employee will then appear in the "Beschikbaar Personeel" section.

## Tips and Best Practices

1. **Client Names Must Match**: When assigning employees, ensure the `currentClient` value exactly matches the client's name in the clients table.

2. **Update Position Requests**: As client needs change, update their `requestedPositions` array to reflect current staffing needs.

3. **Monitor Unfulfilled Requests**: Use the orange "Vraagt om personeel" badges to quickly identify clients needing staff.

4. **Leverage Available Staff**: Check the "Beschikbaar Personeel" section to see who can be assigned to unfulfilled positions.

5. **Hierarchy Alignment**: Match employee hierarchy levels with client requests for optimal staffing.

## Troubleshooting

### Clients page shows "Geen Klanten"

- Ensure you've run the `create-clients-table.sql` script in Supabase
- Check that your Supabase environment variables are configured
- Try running the example clients script

### Employee not showing under client

- Verify the employee's `currentClient` field exactly matches the client name (case-sensitive)
- Refresh the page to reload data from the database
- Check browser console for any API errors

### Position counts don't match

- The system counts employees by their `hierarchy` field
- Ensure employee hierarchy values match those in `data/mockData.js`
- Check that employees have a valid hierarchy assigned

## Future Enhancements

Potential features to add:
- Client creation/editing UI in the frontend
- Drag-and-drop employee assignment
- Client priority levels
- Historical staffing data
- Client contact information
- Project end dates and timelines
- Automatic matching suggestions

