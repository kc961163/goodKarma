# GoodKarma

GoodKarma is a social networking application designed to encourage positive habits and community contributions. Users can share their daily good deeds—such as meditation, journaling, yoga, volunteering, and donations—to build karma points and connect with like-minded individuals.

## Features

### User Authentication
- Secure registration and login
- JWT-based authentication
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
- Comment on posts
- Reply to comments
- Nested comment threads

### AI Life Coaching
- Personalized guidance based on your activities
- Set and track personal growth goals
- Receive insights and recommendations
- Track progress with achievements and setbacks

### Profile
- View personal information
- Track karma statistics by category
- Monitor total karma points

## Technology Stack

### Backend
- Node.js with Express
- MySQL database with Prisma ORM
- JWT for authentication
- RESTful API design

### Frontend
- React.js 
- React Router for navigation
- Context API for state management
- Custom hooks for data fetching
- CSS for styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL database(local) and PostgreSQL (for production)

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

3. Create a `.env` file in the `api` directory with the following variables:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/goodkarma"
   JWT_SECRET="your-secret-key"
   REACT_APP_RAPID_API_KEY="your-rapid-api-key" # For the coaching service
   REACT_APP_RAPID_API_HOST="ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com"
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
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
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

5. The application should now be running at http://localhost:3000

## External API Integration

GoodKarma integrates with the AI Life Coach API to provide personalized coaching features. This external API is used to generate tailored advice based on user profiles and track progress over time.

### API Overview

The Life Coach API provides two primary endpoints:
- **getLifeAdvice**: Generates personalized coaching advice based on user profile and goals
- **updateProgress**: Tracks user progress and provides updated recommendations

The integration enables features like:
- Personalized goal analysis
- Strengths and areas for improvement identification 
- Custom action plans
- Progress tracking and assessment

### Setup Requirements

1. Sign up for an account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the AI Life Coach API (Basic tier is free)
3. Obtain your RapidAPI Key and Host information
4. Configure environment variables:
   - For client: REACT_APP_RAPID_API_KEY and REACT_APP_RAPID_API_HOST
   - For server: RAPID_API_KEY and RAPID_API_HOST

### Implementation Architecture

The application uses a three-layer approach for API integration:

1. **Service Layer**: Handles direct API communication with methods for all API interactions
2. **Data Processing Layer**: Formats requests and processes responses, including utilities for data mapping and response parsing
3. **UI Integration Layer**: React components and hooks for presenting coaching features to users

### API Quota Management

To prevent exceeding API rate limits:

- Each user is limited to one coaching advice call per month
- Each user is limited to one progress update call per month
- API usage is tracked in the database with automatic monthly resets
- Users receive clear notifications about their quota status

For more details about the API endpoints and parameters, refer to the official [AI Life Coach API documentation](https://rapidapi.com/bilgisamapi-api2/api/ai-life-coach-api-personal-development-online-coaching).

## Running Tests

GoodKarma uses Jest and React Testing Library for frontend testing. The test files are located in the `client/src/tests` directory.

### Running Frontend Tests

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Run tests with coverage:
   ```bash
   npm test -- --coverage
   ```

4. Run a specific test file:
   ```bash
   npm test -- AppLayout.test.jsx
   ```

5. Run tests in watch mode (automatically re-runs tests when files change):
   ```bash
   npm test -- --watch
   ```

## Deployment

### Deploying the Frontend to Vercel

1. Create an account on [Vercel](https://vercel.com)

2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Navigate to the client directory:
   ```bash
   cd client
   ```

4. Login to Vercel:
   ```bash
   vercel login
   ```

5. Deploy to Vercel:
   ```bash
   vercel
   ```

6. Configure environment variables in the Vercel dashboard:
   - Go to your project settings
   - Add the following environment variable:
     - `REACT_APP_API_URL` (URL of your deployed backend)

7. For production deployment:
   ```bash
   vercel --prod
   ```

### Deploying the Backend to Render

1. Create an account on [Render](https://render.com)

2. Create a new Web Service:
   - Connect your GitHub repository
   - Select the `api` directory as the root directory
   - Set the build command: `npm install`
   - Set the start command: `npm start`

3. Configure environment variables:
   - `DATABASE_URL` (MySQL connection string or use Render's PostgreSQL service)
   - `JWT_SECRET` (Secure random string for JWT token generation)
   - `REACT_APP_RAPID_API_KEY` (Your RapidAPI key)
   - `REACT_APP_RAPID_API_HOST` (RapidAPI host for the coaching service)
   - `PORT` (Default is 8000)

4. Deploy the service

5. For the database:
   - Option 1: Use Render's PostgreSQL service (requires updating Prisma schema)
   - Option 2: Use external MySQL hosting (PlanetScale, AWS RDS, etc.)

6. Update the Prisma schema for production if needed:
   ```prisma
   datasource db {
     provider = "postgresql" // Change if using PostgreSQL on Render
     url      = env("DATABASE_URL")
   }
   ```

7. Run migrations on the production database:
   ```bash
   npx prisma migrate deploy
   ```

### Deployed Application

The GoodKarma application is now live:

#### Frontend (Vercel)
- URL: [https://goodkarma-client.vercel.app](https://goodkarma-client.vercel.app)
- Repository: This repository's client directory

#### Backend API (Render)
- URL: [https://goodkarma-api.onrender.com](https://goodkarma-api.onrender.com)
- Repository: This repository's api directory

### Connecting to the Production API

The frontend deployed on Vercel is configured to use the production API hosted on Render. This connection is managed through environment variables:

```properties
REACT_APP_API_URL=https://goodkarma-api.onrender.com

## Project Structure

### Backend Structure
```
api/
├── index.js                # Main Express server setup
├── package.json
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

### Comments
- `GET /posts/:id/comments` - Get comments for a post
- `POST /posts/:id/comments` - Add a comment to a post
- `PUT /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment
- `GET /posts/:id/comments/count` - Get comment count for a post

### Likes
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/like` - Unlike a post
- `GET /posts/:id/likes` - Get like status and count

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

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Normalized CSS from [necolas/normalize.css](https://github.com/necolas/normalize.css)
- Icons for good deeds are provided by native emoji support

---

Created with ❤️ by Krishna Choudhary

**TL;DR –** GoodKarma is a social app that helps users track positive habits like meditation and volunteering, while providing AI coaching for personal growth.