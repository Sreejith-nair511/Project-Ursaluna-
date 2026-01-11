# ASCEND - Autonomous Surveyor Mission Interface

## Overview
ASCEND is a sophisticated web-based dashboard designed for monitoring and controlling autonomous UAV missions, particularly suited for planetary exploration scenarios. The interface provides real-time telemetry, 3D visualization, and comprehensive mission control capabilities for GNSS-denied environments.

## Features
- Real-time UAV telemetry monitoring
- Interactive 3D visualization of the drone and its environment
- Mission timeline and progress tracking
- Comprehensive system architecture overview
- Navigation and docking panel controls
- Safety monitoring and alerts
- Feature detection visualization
- Responsive design for various screen sizes

## Technology Stack
- Next.js 16.0.10
- React 19.2.0
- TypeScript
- Tailwind CSS
- Three.js for 3D visualization
- Shadcn/ui components
- Lucide React icons

## Architecture
The application follows a component-based architecture with:
- Main dashboard layout with sidebar navigation
- Modular section components for different functionalities
- 3D visualization engine powered by Three.js
- Responsive UI components built with Radix UI primitives

## Installation
1. Clone the repository
2. Install dependencies with `pnpm install`
3. Run the development server with `pnpm dev`

## Usage
The dashboard is designed to be intuitive for operators managing autonomous UAV missions. Key controls include:
- Mission start/pause/reset functionality
- Real-time telemetry monitoring
- 3D model visualization
- System status overview

## License
This project is licensed under the MIT License.