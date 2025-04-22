# GoodKarma

GoodKarma is a social networking application designed to encourage positive habits and community contributions. Users can share their daily good deeds—such as meditation, journaling, yoga, volunteering, and donations—to build karma points and connect with like-minded individuals.

## Features

### User Authentication
- Secure registration and login
- JWT-based authentication with HTTP-only cookies
- Protected routes for authenticated users

### Social Feed
- View and interact with posts from all users
- Pagination for browsing through content
- Visual indicators for different types of good deeds

### Personal Posts
- Create and manage your own good deed posts
- Structured format for different deed types (meditation, volunteering, etc.)
- Edit and delete functionality

### Social Interaction
- Like/unlike posts
- Comment on posts with threaded replies
- Nested comment threads with full CRUD operations

### AI Life Coaching
- Personalized guidance based on your activity patterns
- Set and track personal growth goals
- Receive AI-generated insights and recommendations
- Monthly progress tracking with achievements and setbacks

### Profile
- View personal information
- Track karma statistics by deed category
- Monitor total karma points accumulated

## Technology Stack

### Backend
- Node.js with Express
- MySQL database (local development) / PostgreSQL (Render deployment)
- JWT with HTTP-only cookies for authentication
- RESTful API design

### Frontend
- React.js (v18)
- React Router for navigation
- Context API for state management
- Custom hooks for data fetching and state
- CSS with responsive design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL database (for local development)

## Database Configuration Options

### Option 1: Local Development with MySQL

1. Create or update your `.env.local` file in the `api` directory:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/goodkarma"
   JWT_SECRET="your-jwt-secret-key"
   RAPID_API_KEY="your-rapid-api-key"
   RAPID_API_HOST="ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com"
   ```

2. Ensure your `schema.prisma` file is configured for MySQL:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migrations for your MySQL database:
   ```bash
   npx prisma migrate dev
   ```

4. To use this configuration, copy it to your active `.env` file:
   ```bash
   cp .env.local .env
   ```

### Option 2: Deployment with PostgreSQL on Render

1. Create or update your `.env` file for Render deployment:
   ```
   DATABASE_URL="postgresql://postgres:password@postgres.render.com:5432/goodkarma"
   JWT_SECRET="your-production-secret-key"
   RAPID_API_KEY="your-rapid-api-key"
   RAPID_API_HOST="ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com"
   PORT="10000"  # Render will set this automatically
   ```

2. Modify your `schema.prisma` file for PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

3. Update your `package.json` to include Render-specific scripts:
   ```json
   "scripts": {
     "start": "node index.js",
     "preinstall": "npm i -D prisma",
     "postinstall": "npx prisma db push"
   }
   ```

4. For local testing of the PostgreSQL setup, you can create a backup of your current environment:
   ```bash
   cp .env .env.current && cp .env.example .env
   ```

## Switching Between Environments

To switch between MySQL (local) and PostgreSQL (Render):

1. **For local MySQL development**:
   - Make sure your `.env` file contains MySQL configuration: `cp .env.local .env`
   - Ensure `schema.prisma` has `provider = "mysql"`
   - Use `npx prisma migrate dev` for schema changes

2. **For PostgreSQL Render preparation**:
   - Update your `.env` file with PostgreSQL configuration
   - Change `schema.prisma` to use `provider = "postgresql"`
   - Use `npx prisma db push` instead of migrations

### Setting Up the Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/goodkarma.git
   cd goodkarma
   ```

2. Install API dependencies:
   ```bash
   cd api
   npm install
   ```

3. Choose your database configuration option (MySQL or PostgreSQL) and set up the appropriate `.env` file.

4. Run the database setup (migrations for MySQL, push for PostgreSQL):
   ```bash
   # For MySQL
   npx prisma migrate dev
   
   # For PostgreSQL
   npx prisma db push
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Setting Up the Frontend

1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client` directory:
   ```
   REACT_APP_API_URL="http://localhost:8000"
   REACT_APP_RAPID_API_KEY="your-rapid-api-key"
   REACT_APP_RAPID_API_HOST="ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com"
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

5. The application should now be running at http://localhost:3000

## External API Integration

GoodKarma integrates with the AI Life Coach API to provide personalized coaching features.

### API Features

- **Personalized Advice:** Generates tailored guidance based on user's activities
- **Goal Analysis:** Helps identify and track personal growth goals
- **Progress Tracking:** Monitors achievements and setbacks over time
- **Action Planning:** Creates customized action plans based on user preferences

### API Quota Management

To manage API usage limits:

- Each user is limited to one coaching advice call per month
- Each user is limited to one progress update call per month
- API usage is tracked in the database with automatic monthly resets
- Clear UI indicators show users their current quota status

## Running Tests

GoodKarma uses Jest and React Testing Library for frontend testing.

### Running Frontend Tests

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Run all tests:
   ```bash
   npm test
   ```

## Deployment

### Preparing for Deployment

1. Update your API's index.js to use environment variables for PORT:
   ```javascript
   const PORT = parseInt(process.env.PORT) || 8000;
   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
   });
   ```

2. Update your Prisma schema for production database:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   
   datasource db {
     provider = "postgresql" // Change to postgresql for Render
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

3. Update package.json scripts in the API folder:
   ```json
   "scripts": {
     "start": "node index.js",
     "preinstall": "npm i -D prisma",
     "postinstall": "npx prisma db push"
   }
   ```

### Deploying to Render

1. Create a PostgreSQL database on Render
2. Create a Web Service on Render pointing to your repo
3. Set the root directory to `api`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Configure environment variables in Render dashboard using your `.env` values

### Deploying to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to client directory: `cd client`
3. Run: `vercel`
4. Set environment variables in Vercel dashboard

## Project Structure

### Backend Structure
```
api/
├── index.js                # Main Express server setup
├── package.json            # Dependencies and scripts
├── .env                    # Active environment configuration
├── .env.local              # Local MySQL configuration
├── .env.example            # Example configuration template
└── prisma/
    ├── migrations/         # Database migrations
    └── schema.prisma       # Database schema
```

### Frontend Structure
```
client/
├── public/                 # Static assets
└── src/
    ├── components/         # React components
    │   └── coaching/       # Coaching feature components
    ├── config/             # Configuration files
    ├── hooks/              # Custom React hooks
    ├── security/           # Authentication utilities
    ├── services/           # External API services
    ├── style/              # CSS stylesheets
    ├── tests/              # Unit tests
    ├── utils/              # Utility functions
    └── index.jsx           # Application entry point
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Authenticate user
- `POST /logout` - Log out user
- `GET /me` - Get current user information

### Posts
- `GET /posts` - Get user's posts
- `POST /posts` - Create a new post
- `GET /posts/:id` - Get a specific post
- `PUT /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Feed
- `GET /feed` - Get all posts (paginated)
- `GET /feed/:id` - Get a specific post from feed

### Social Interactions
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/like` - Unlike a post
- `GET /posts/:id/likes` - Get like status and count
- `GET /posts/:id/comments` - Get comments for a post
- `POST /posts/:id/comments` - Add a comment to a post
- `PUT /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

### Coaching
- `GET /users/:userId/coaching` - Get coaching data
- `POST /users/:userId/coaching` - Update coaching data
- `GET /users/:userId/coaching/api-status` - Check API quota status
- `GET /users/:userId/coaching/progress` - Get progress data
- `POST /users/:userId/coaching/progress` - Update progress data

### Statistics
- `GET /users/:userId/karma-stats` - Get karma statistics

## Usage Guide

### Registration and Login
1. Visit the homepage
2. Click "Create Account" to register
3. Fill in your email, password, and name
4. After registration, you'll be redirected to the feed

### Creating a Good Deed
1. Navigate to "My Posts"
2. Select a deed type (meditation, journaling, yoga, volunteering, donation)
3. Fill in the required details
4. Add any additional notes
5. Click "Share Good Deed"

### Interacting with Community Posts
1. Browse the feed to see posts from all users
2. Like posts by clicking the heart icon
3. Comment on posts by viewing the post details
4. Reply to comments to engage in discussions

### Using AI Coaching
1. Go to your profile page
2. Navigate to the "Life Coaching" tab
3. Complete your coaching profile
4. Set personal growth goals
5. View personalized insights
6. Track your progress

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [React](https://reactjs.org/) - Frontend library
- [Express](https://expressjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - ORM for database access
- [RapidAPI](https://rapidapi.com/) - For the AI Life Coach API
- Icons for good deeds are provided by native emoji support