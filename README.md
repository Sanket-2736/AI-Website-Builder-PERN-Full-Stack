# AI Website Builder 🚀

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for building websites with AI assistance. This project allows users to create, preview, and manage web projects through an intuitive interface, leveraging AI for enhanced functionality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **AI-Powered Website Building**: Leverage OpenAI API for intelligent content generation and suggestions
- **User Authentication**: Secure login and registration using Better Auth
- **Project Management**: Create, edit, preview, and version control web projects
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Real-time Preview**: Live preview of projects during editing
- **Community Features**: Share and explore projects created by other users
- **Pricing Plans**: Subscription-based model with different tiers

## 🛠 Tech Stack

### Frontend (Client)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Better Auth UI** - Authentication components

### Backend (Server)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **Better Auth** - Authentication library
- **OpenAI API** - AI integration
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js 18+ (or compatible)
- npm (or pnpm/yarn)
- PostgreSQL database
- OpenAI API key

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "AI Website Builder"
   ```

2. **Set up the backend:**
   ```bash
   cd server
   npm install
   ```

3. **Set up the frontend:**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the server directory
   - Fill in the required environment variables (see [Environment Variables](#environment-variables) section)

5. **Set up the database:**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

## 🎯 Usage

1. **Start the backend server:**
   ```bash
   cd server
   npm run server
   ```
   The server will run on http://localhost:3000

2. **Start the frontend development server:**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on http://localhost:5173

3. **Open your browser and navigate to http://localhost:5173**

### Available Scripts

#### Client
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Server
- `npm run server` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Compile TypeScript

## 📁 Project Structure

```
AI Website Builder/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, and other assets
│   │   ├── components/              # Reusable UI components
│   │   │   ├── EditorPanel.tsx      # Main editing interface
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── Sidebar.tsx          # Side navigation
│   │   │   ├── ProjectPreview.tsx   # Project preview component
│   │   │   └── ...
│   │   ├── pages/                   # Route components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Projects.tsx         # Project editor
│   │   │   ├── MyProjects.tsx       # User's projects list
│   │   │   ├── Preview.tsx          # Project preview
│   │   │   ├── Community.tsx        # Community projects
│   │   │   ├── Pricing.tsx          # Pricing plans
│   │   │   ├── Settings.tsx         # User settings
│   │   │   └── auth/                # Authentication pages
│   │   ├── lib/                     # Utility functions and configurations
│   │   │   ├── auth-client.ts       # Authentication client
│   │   │   ├── utils.ts             # General utilities
│   │   │   └── prisma.ts            # Database client (if used)
│   │   ├── types/                   # TypeScript type definitions
│   │   └── providers.tsx            # React context providers
│   ├── package.json
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── README.md                    # Client-specific documentation
├── server/                          # Backend Express application
│   ├── prisma/                      # Database schema and migrations
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   ├── src/                         # (Note: files are in root server/)
│   ├── controllers/                 # Route controllers
│   │   └── userController.ts        # User-related endpoints
│   ├── lib/                         # Utility libraries
│   │   ├── auth.ts                  # Authentication setup
│   │   └── prisma.ts                # Database client
│   ├── middlewares/                 # Express middlewares
│   │   └── auth.ts                  # Authentication middleware
│   ├── types/                       # TypeScript type definitions
│   │   └── express.d.ts             # Express type extensions
│   ├── configs/                     # Configuration files
│   │   └── openai.ts                # OpenAI API configuration
│   ├── server.ts                    # Main server file
│   ├── package.json
│   └── tsconfig.json                # TypeScript configuration
└── README.md                        # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/*` - Authentication routes (handled by Better Auth)

### General
- `GET /` - Server health check

### User Management
- Additional user-related endpoints defined in `controllers/userController.ts`

## 🔐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_website_builder"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# CORS
TRUSTED_ORIGINS="http://localhost:5173"

# Other configurations as needed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using MERN stack and AI
