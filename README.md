# ChatApp Client

This is the frontend application for ChatApp, a real-time messaging platform. It is built with Next.js and React, featuring a modern, highly responsive chat interface.

## 🚀 Features

- **Real-time Messaging**: Powered by Socket.IO for instant delivery.
- **Rich Media Uploads**: Drag-and-drop file uploads with Cloudinary integration, supporting images and videos with size restrictions.
- **Message Forwarding**: Right-click context menus and drag-and-drop mechanics (via `@dnd-kit`) to forward messages seamlessly.
- **State Management**: Robust state handling with Redux Toolkit and Redux Persist.
- **Read Receipts & Presence**: Live online/offline status, typing indicators, and message read receipts.
- **Sleek UI/UX**: Dark mode styling with Framer Motion animations for smooth transitions and custom modals.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **State Management**: Redux Toolkit & Redux Persist
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Styling**: Vanilla CSS (CSS Variables for theming)

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env.local` and configure your API and Socket URLs.
   ```bash
   cp .env.example .env.local
   ```
   *(By default, it will connect to `http://localhost:4000`)*

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
