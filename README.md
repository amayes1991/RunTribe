# RunTribe - Full Stack Running Community App

A full-stack application for runners to connect, organize meetups, and share their running experiences.

## Project Structure

```
RunApp/
├── RunTribe.Api/          # .NET 8 Web API Backend
│   ├── Controllers/       # API endpoints
│   ├── Models/           # Data models/entities
│   ├── DbContext/        # Entity Framework context
│   ├── Migrations/       # Database migrations
│   └── Program.cs        # Application entry point
├── runtribe/             # Next.js 14 Frontend
│   ├── app/             # App router pages
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
└── README.md            # This file
```

## Technology Stack

### Backend (.NET 8)
- **Framework**: ASP.NET Core Web API
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT-based authentication
- **Key Features**: User management, groups, meetups, posts, comments

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Key Features**: Dashboard, user profiles, group management

## Getting Started

### Backend Setup
```bash
cd RunTribe.Api
dotnet restore
dotnet run
```

### Frontend Setup
```bash
cd runtribe
npm install
npm run dev
```

## Key Files to Understand

### Backend
- `RunTribe.Api/Program.cs` - Application configuration and startup
- `RunTribe.Api/Models/` - Data models (User, Group, Meetup, Post, etc.)
- `RunTribe.Api/Controllers/` - API endpoints
- `RunTribe.Api/DbContext/ApplicationDbContext.cs` - Database context

### Frontend
- `runtribe/app/layout.js` - Root layout component
- `runtribe/app/page.js` - Home page
- `runtribe/app/dashboard/page.js` - User dashboard
- `runtribe/app/login/page.js` - Authentication pages

## Database Schema

The application uses SQLite with the following main entities:
- **Users**: User profiles and authentication
- **Groups**: Running groups/clubs
- **GroupMembers**: Many-to-many relationship between users and groups
- **Meetups**: Scheduled running events
- **Posts**: User-generated content
- **Comments**: Responses to posts
- **Cities**: Location data for meetups

## Development Notes

- The backend API runs on `https://localhost:7000` (or similar)
- The frontend runs on `http://localhost:3000`
- Database file: `RunTribe.Api/RunTribeDb.db`
- Environment variables are configured in `runtribe/env.example` 