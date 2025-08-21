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

### Mobile Data Import System (Added: August 21, 2025)
The application now includes a **complete mobile data import system** that fetches real mobile phone data from GSMArena via RapidAPI:

**Import System Features:**
- **RapidAPI GSMArenaParser Integration**: Connected with user's RAPIDAPI_KEY for authentic mobile data
- **Brand Management**: Imported 35 real mobile phone brands (Samsung, Apple, Xiaomi, OnePlus, Google, etc.)
- **Mobile Data Import**: Imported 73+ real mobile phones with complete specifications, images, and technical details
- **Multiple Import Methods**: Latest mobiles, brand-specific imports, search-based imports, and popular brands import
- **Admin Interface**: Full-featured admin panel at `/admin/import` with real-time status and progress tracking
- **Error Handling**: Robust error handling with detailed logging and graceful fallbacks
- **Rate Limiting**: Built-in delays to respect API limits and prevent throttling

**Data Quality:**
- 100% authentic mobile specifications from GSMArena
- Real product images and technical specifications
- Detailed spec sheets including display, camera, performance, and battery information
- Proper data transformation from API format to local database schema

**Current Database Status:**
- 35 mobile phone brands imported
- 73+ mobile devices with complete specifications
- All data sourced from official GSMArena database via RapidAPI

This import system provides the foundation for accurate mobile phone comparisons with real-world data.

### Comprehensive Image Optimization System (Added: August 21, 2025)
The application now features a **professional-grade image optimization system** designed specifically for mobile phone displays:

**Advanced SafeImage Component:**
- **Multi-Source Fallbacks**: Automatically tries multiple image URLs with intelligent fallback chain
- **Progressive Loading**: Displays low-quality placeholders while high-quality images load
- **Quality Settings**: Supports low/medium/high quality modes with automatic GSMArena URL optimization
- **Brand-Specific Fallbacks**: Each brand has curated high-quality fallback images
- **Responsive Sizing**: Optimizes images based on screen size and device capabilities
- **Error Handling**: Graceful degradation with informative error states

**Enhanced Image Utilities:**
- **Multiple Quality Levels**: Thumbnail, medium, and high-quality image generation
- **Responsive Source Sets**: Different image qualities for different screen sizes
- **Brand Fallback System**: Comprehensive fallback images for all supported brands
- **URL Optimization**: Intelligent GSMArena URL transformation for optimal loading
- **Preload System**: Critical image preloading for improved performance

**Updated Mobile Components:**
- **MobileCard**: Enhanced with gradient backgrounds, hover effects, and quality indicators
- **MobileHero**: High-quality main images with rich thumbnail galleries
- **ImageGallery**: Professional gallery with progressive loading and enhanced navigation
- **Database Integration**: All 70+ mobile entries updated with optimized image URLs and carousel sets

**Image Quality Features:**
- High-quality flagship images for each brand
- Multiple angles and view options per device
- PKR pricing badges and quality indicators
- Dark mode compatible gradients and styling
- Lazy loading and performance optimization

The system ensures reliable image display across all devices while maintaining Pakistani market focus with PKR pricing integration.

### AR/VR Integration System (Added: August 21, 2025)
The application now features a **cutting-edge AR/VR integration system** providing immersive mobile phone experiences:

**Core AR/VR Service (`ar-vr-service.ts`):**
- **Camera Access Management**: Seamless WebRTC camera initialization with optimal AR settings
- **3D Rendering Engine**: Real-time phone model rendering with brand-specific materials and textures
- **Device Dimensions Database**: Accurate physical dimensions for all supported mobile brands
- **Session Management**: Handles multiple AR modes with persistent state management
- **Hand Size Calibration**: Adjustable scaling for different hand sizes (small/medium/large)

**AR/VR Features:**

1. **Virtual Phone Try-On (`virtual-tryon.tsx`)**:
   - Live camera feed with real-time phone overlay
   - Interactive positioning with tap-to-move functionality
   - Hand size adjustment for accurate scale comparison
   - Device specifications display with live dimensions
   - Quality indicators and size measurements

2. **AR Phone Comparison (`ar-comparison.tsx`)**:
   - Multi-device AR rendering (2-4 phones simultaneously)
   - Side-by-side and overlay comparison modes
   - Interactive device positioning and selection
   - Real-time size and spec comparisons in AR space
   - Intelligent arrangement algorithms

3. **360° Phone Exploration (`phone-360-view.tsx`)**:
   - Interactive 3D phone models with realistic materials
   - Drag-to-rotate and auto-rotation modes
   - Brand-specific color schemes and textures
   - Zoom controls (0.5x to 3.0x magnification)
   - Real-time specification overlays
   - Camera and detail rendering

**AR/VR Hub Interface (`ar-vr-hub.tsx`)**:
- Unified entry point for all AR/VR experiences
- System requirements checking and camera permissions
- Feature comparison matrix showing capabilities
- Responsive design with mobile optimization
- Error handling and fallback notifications

**Integration Points:**
- **Mobile Hero Component**: AR/VR experience button on individual phone pages
- **Compare Page**: Multi-phone AR comparison when 2+ phones selected
- **Cross-Component State**: Seamless data flow between AR features
- **Responsive Design**: Optimized for desktop and mobile AR experiences

**Technical Features:**
- WebGL-based 3D rendering with performance optimization
- Progressive canvas rendering with 60fps targeting
- Touch and mouse interaction handling
- Real-time camera feed processing
- Brand-specific fallback systems
- Cross-browser compatibility checks

This AR/VR system positions the mobile comparison website as a leader in next-generation e-commerce visualization technology.