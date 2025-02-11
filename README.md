# Excalidraw Playgrounds

_A collaborative digital White Board tool built for real-time editing and shared functionality._

## About the repo

Excalidraw Playgrounds repo is a **Turborepo(monorepo)** that consists of three main applications, along with shared packages used across these applications. It provides a seamless real-time collaborative drawing experience, enabling multiple users to create and edit diagrams simultaneously.

## Getting Started

To set up and run the project locally, follow these steps:

0. **Clone the repo**

   ```sh
   $ you know how
   ```

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Build the project:**
   ```sh
   npm run build
   ```
3. **Start the development server:**
   ```sh
   npm start
   ```

## Project Structure

The directory structure is organized as follows:

**Main Applications**

- `apps/excalidraw-frontend/` - Next.js frontend for the Playgrounds.
- `apps/http-backend` - HTTP server for authentication, user management, room management.
- `apps/ws-backend` - Web Socket Server built to support the real time data transfer.

**Common Packages**

- `packages/**` - folder to find all the packages shared by the main applications

## Features

- 🎨 **Infinite WhiteBoard with Essential Collaborative Tools**
- 💬 **Real-time collaborative drawing**
- 👥 **Multi-user support with simultaneous editing**

## Technologies Used

- **Turborepo**
- **Next.js**
- **Node.js**
- **Web Sockets**
- **TypeScript**
- **Postgres**

## Contributing

We welcome contributions! 🚀 If you'd like to contribute to Excalidraw Playgrounds:

- Open an **issue** to discuss bugs or feature requests.
- Submit a **pull request** with improvements or fixes.

Happy coding! 🎉
