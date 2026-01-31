# Wiekanwat - Sparke & Keane Employee Board

Internal consultancy web application for managing employee information, client relationships, and organizational structure.

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Employee Management
- **Information Board**: Overview of all employees with advanced filtering
- **Employee Profiles**: Detailed view of individual employee information
- **Add/Edit Employees**: Full CRUD operations for employee data
- **Organizational Structure**: Visual representation of company hierarchy

### Client Management
- **Client Dashboard**: Overview of all clients and their details
- **Client Profiles**: Detailed client information with assigned employees
- **Employee Assignments**: Manage many-to-many relationships between employees and clients
- **Project Tracking**: Track project names and start dates for assignments

### Dashboard & Analytics
- **Metrics**: Total employees, available employees, clients, and active clients
- **Charts**: Hierarchy distribution, industry distribution, utilization trends
- **Quick Stats**: Average employees per client, most common skills, busiest months
- **Recent Activity**: Latest employee-client assignments

### Authentication
- **Secure Login**: Supabase authentication
- **Protected Routes**: Session-based access control
- **User Management**: Login/logout functionality

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with modern gradients
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: Supabase Auth

## Database Structure

The application uses three main tables:
- `employees`: Employee information and profiles
- `clients`: Client information and details
- `employee_clients`: Many-to-many relationship for assignments

See `DATABASE_SETUP.md` for detailed schema information.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── add/               # Add employee page
│   ├── api/               # API routes
│   ├── clients/           # Client pages
│   ├── dashboard/         # Analytics dashboard
│   ├── employee/          # Employee profile pages
│   ├── login/             # Authentication
│   └── organizational-*/  # Organization views
├── components/            # React components
├── contexts/              # React contexts (Auth)
├── utils/                 # Utility functions and API clients
├── scripts/               # Database setup scripts
└── data/                  # Mock data and constants
```
