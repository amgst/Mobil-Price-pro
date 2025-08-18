# Overview

This is a mobile phone price comparison website built with a full-stack architecture. The application allows users to browse, search, and compare mobile phones from various brands with detailed specifications and pricing information. The website is designed to be SEO-optimized with a clean URL structure that maintains existing indexed paths.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using **React 18** with **Vite** as the build tool and development server. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight routing solution. The UI is built with **Tailwind CSS** for styling and **shadcn/ui** components for consistent design patterns.

**Key Frontend Decisions:**
- **Wouter Router**: Chosen over React Router for its smaller bundle size and simpler API
- **Tailwind CSS**: Provides utility-first styling with custom CSS variables for theming
- **shadcn/ui Components**: Pre-built accessible React components with consistent styling
- **React Query (@tanstack/react-query)**: Manages server state, caching, and data fetching
- **React Helmet Async**: Handles SEO meta tags and structured data for search engine optimization

## Backend Architecture
The backend uses **Express.js** with **TypeScript** in ESM format. The server follows a RESTful API pattern with routes organized in a separate module. Data persistence is handled through an abstract storage interface that currently uses in-memory storage with sample data.

**Key Backend Decisions:**
- **Express.js**: Lightweight and flexible web framework
- **TypeScript with ESM**: Modern JavaScript with type safety and ES module support
- **Abstract Storage Pattern**: IStorage interface allows easy swapping between storage implementations
- **Middleware Architecture**: Custom logging middleware for API requests and error handling

## Data Storage
The application is configured to use **PostgreSQL** as the primary database with **Drizzle ORM** for database operations. The schema is defined in a shared module and uses **Drizzle Kit** for database migrations.

**Database Schema Design:**
- **Brands Table**: Stores mobile phone manufacturers with slug-based URLs
- **Mobiles Table**: Stores detailed mobile phone information with JSONB fields for flexible spec storage
- **Shared Schema**: TypeScript-first schema definitions with Zod validation integration

## State Management
Client-side state is managed through **React Query** for server state and **React's built-in state** for local component state. No additional global state management library is used, keeping the architecture simple.

## SEO Optimization
The application implements comprehensive SEO features including meta tags, structured data (JSON-LD), and canonical URLs. The URL structure is designed to be SEO-friendly with brand and model-based paths.

**SEO Features:**
- Dynamic meta tags per page
- OpenGraph and Twitter Card support
- JSON-LD structured data for products and breadcrumbs
- Canonical URL management
- Breadcrumb navigation for better user experience and SEO

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon Database (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Drizzle Kit**: Database migration and schema management tool

## UI Components
- **Radix UI**: Accessible headless UI components for complex interactions
- **Lucide React**: Icon library providing consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design system

## Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds

## External Services
The application is configured to work with **Replit's development environment** with specific plugins for error handling and live reloading. The architecture supports easy integration with image CDN services (ImageKit paths are included in the schema) and other external APIs for enhanced functionality.

### AI Service Integration
The application includes an **OpenAI-powered AI service** (`server/ai-service.ts`) for generating mobile phone specifications, marketing content, and comparisons. The service is designed with robust fallback mechanisms:

**AI Service Features:**
- **Mobile Spec Generation**: Creates realistic specifications for new phone entries
- **Content Enhancement**: Generates SEO descriptions and marketing content
- **Detailed Specifications**: Produces comprehensive technical spec sheets
- **Similar Phone Suggestions**: Recommends comparable devices for comparisons

**Fallback System (Added: August 18, 2025):**
- **Graceful Degradation**: When OpenAI API is unavailable or has billing issues, the service automatically falls back to template-based generation
- **Brand-Aware Defaults**: Fallback specs are tailored based on brand positioning (Apple, Samsung, Google, etc.)
- **No Service Interruption**: App remains fully functional even without AI service connectivity
- **Error Logging**: All AI failures are logged while maintaining user experience

This ensures the application runs reliably regardless of external API availability.