# 📝 TanStack Todos

A modern, full-stack todo application built with the latest TanStack ecosystem, featuring authentication, database integration, and a beautiful UI.

## ✨ Features

- 🔐 **Authentication** - Secure user authentication with Better Auth (GitHub OAuth & Magic Link)
- 📊 **Database** - PostgreSQL with Drizzle ORM for type-safe database operations
- 🎨 **Modern UI** - Beautiful, responsive interface built with Radix UI and Tailwind CSS
- 🌓 **Dark Mode** - Theme switching with next-themes
- 🔄 **Real-time Updates** - Optimistic UI updates with TanStack Query
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🛠️ **Developer Experience** - Hot reload, TypeScript, ESLint, Prettier, and more
- 🚀 **Production Ready** - Docker support and Netlify deployment configuration

## 🛠️ Tech Stack

### Frontend

- **[React 19](https://react.dev/)** - UI library
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing with SSR support
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[TanStack Form](https://tanstack.com/form)** - Type-safe form management
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Motion](https://motion.dev/)** - Smooth animations

### Backend

- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Reliable database
- **[Nodemailer](https://nodemailer.com/)** - Email sending for magic links

### Development Tools

- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[Docker](https://www.docker.com/)** - Containerization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Docker** and **Docker Compose** (for local database)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:marwen-mrabti/ts-todos.git
cd ts-todos
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Base URL
BASE_URL=http://localhost:3000

# Database (Docker will handle this automatically)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=db_password
DB_NAME=ts_todos
DB_PORT=5432
DATABASE_URL=postgresql://postgres:db_password@localhost:5432/ts_todos

# Auth
BETTER_AUTH_SECRET="your-secret-key-here"
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email SMTP (for magic link authentication)
SMTP_SERVICE="gmail"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

> **Note**: For GitHub OAuth, create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)

### 4. Start the Database

The project uses Docker Compose to run PostgreSQL locally:

```bash
pnpm db:up
```

### 5. Run Database Migrations

```bash
pnpm db:push
```

### 6. Start the Development Server

```bash
pnpm dev
```

The application will be available at **http://localhost:3000**

## 📜 Available Scripts

### Development

- `pnpm dev` - Start development server with database
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code with Prettier
- `pnpm check` - Format and lint code

### Database

- `pnpm db:up` - Start PostgreSQL container
- `pnpm db:down` - Stop PostgreSQL container
- `pnpm db:restart` - Restart PostgreSQL container
- `pnpm db:reset` - Reset database (removes all data)
- `pnpm db:logs` - View database logs
- `pnpm db:studio` - Open Drizzle Studio (database GUI) at http://localhost:4982
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema changes
- `pnpm db:pull` - Pull schema from database

## 🏗️ Project Structure

```
01-ts-template_todos/
├── src/
│   ├── assets/           # Static assets and styles
│   ├── collections/      # Database collections
│   ├── components/       # React components
│   │   ├── app/         # App-level components (Header, etc.)
│   │   └── ui/          # Reusable UI components
│   ├── db/              # Database schema and configuration
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   ├── lib/             # Utility functions and helpers
│   ├── middleware/      # Server middleware
│   ├── routes/          # File-based routing
│   │   ├── _auth/      # Authentication routes
│   │   ├── _authed/    # Protected routes
│   │   └── api/        # API routes
│   ├── serverFns/       # Server functions
│   └── router.tsx       # Router configuration
├── public/              # Public static files
├── .env.example         # Environment variables template
├── docker-compose.yaml  # Docker configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🔐 Authentication

The app supports two authentication methods:

1. **GitHub OAuth** - Sign in with your GitHub account
2. **Magic Link** - Passwordless authentication via email

Configure the authentication providers in your `.env` file.

## 🗄️ Database Management

### Using Drizzle Studio

Drizzle Studio provides a visual interface to manage your database:

```bash
pnpm db:studio
```

Visit **http://localhost:4982** to access the database GUI.

### Database Reset

To reset the database and start fresh:

```bash
pnpm db:reset
```

> ⚠️ **Warning**: This will delete all data!

## 🎨 UI Components

The project uses [shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI. Components are located in `src/components/ui/` and can be customized via `components.json`.

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

The project uses Vitest with React Testing Library for unit and integration tests.

## 🚢 Deployment

### Netlify

The project is configured for Netlify deployment:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify dashboard
4. Deploy!

The `netlify.toml` file contains the deployment configuration.

### Docker

Build and run with Docker:

```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) - For the amazing ecosystem
- [Better Auth](https://www.better-auth.com/) - For the authentication solution
- [Drizzle ORM](https://orm.drizzle.team/) - For the type-safe ORM
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful components

---
