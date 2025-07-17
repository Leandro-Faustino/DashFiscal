# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DashFiscal is a Next.js application for fiscal reconciliation between SAT and Questor systems. It automates the identification of discrepancies between fiscal spreadsheets, designed for accountants and financial managers.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Architecture

### Core Structure

The application follows Next.js 13 App Router pattern with these key directories:

- `/app` - Pages and layouts using App Router
- `/components` - Reusable UI components (uses shadcn/ui)
- `/lib` - Business logic and utilities
- `/context` - React context providers for state management
- `/hooks` - Custom React hooks

### Key Features

1. **Authentication System**: Context-based authentication with localStorage persistence (test credentials: admin@dashfiscal.com.br / 123456)
2. **Fiscal Validation Engine**: Complex validation logic in `lib/validation-service.ts` for comparing SAT vs Questor data
3. **Excel Processing**: XLSX library integration for reading/writing spreadsheets
4. **Report Generation**: Automated Excel report creation with formatting

### Technology Stack

- **Framework**: Next.js 13.5.1 with App Router
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Context (Auth, Settings, Sidebar)
- **Data Processing**: XLSX for Excel manipulation
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Important Business Logic

#### Validation Service (`lib/validation-service.ts`)

The core validation engine implements complex fiscal reconciliation rules:

- **SAT vs Questor Comparison**: Groups invoices by document number and series
- **Field Validation**: Normalizes CNPJs, dates, and monetary values before comparison
- **Tolerance Handling**: 0.01 tolerance for rounding differences
- **Error Classification**: Distinguishes between errors and warnings
- **Two Validation Types**:
  - `validateSatQuestor`: For issued invoices
  - `validateSatQuestorDestinadas`: For received invoices

#### Context Providers

- **AuthContext**: Simple authentication with hardcoded test credentials
- **SidebarContext**: Navigation state management
- **SettingsContext**: Application configuration

### File Upload and Processing

The application processes Excel/CSV files through:
1. File upload components in `app/invoices/components/`
2. XLSX reading in ValidationService
3. Complex grouping and totaling algorithms
4. Excel report generation with formatting

### UI Components

Uses shadcn/ui component library with:
- Consistent design system
- Dark/light theme support via next-themes
- Responsive layout with sidebar navigation
- Toast notifications via Sonner

### Key Files to Understand

- `lib/validation-service.ts` - Core business logic for fiscal validation
- `app/layout.tsx` - Root layout with providers
- `context/auth-context.tsx` - Authentication implementation
- `app/invoices/page.tsx` - Main validation interface
- `components/ui/` - shadcn/ui components

### Development Notes

- Uses pnpm as package manager
- TypeScript throughout the codebase
- Component composition pattern with shadcn/ui
- File-based routing with App Router
- Context providers for global state
- Excel files are processed client-side