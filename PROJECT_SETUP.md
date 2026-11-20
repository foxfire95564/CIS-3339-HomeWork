# CIS 3339 Homework 1
## Enterprise Applications Development — Vue 3 and MongoDB Migration

### Project Overview

This project is a full-stack Student, Course, and Enrollment Management application developed using Vue 3, Node.js, Express, and MongoDB Community Edition.

The application allows users to register students, manage university courses, create student enrollments, and view course rosters through a responsive web dashboard.

The frontend uses the Vue 3 Composition API, Vue Router, and Pinia for state management. The backend uses Express and Mongoose to provide REST API endpoints and persistent MongoDB storage.

The completed Vue application is served by the Express backend in production, allowing all dashboards to run from a single local server.

### Technologies Used

| Technology | Purpose |
|---|---|
| Vue 3 | Frontend user interface |
| Vite | Frontend development and production builds |
| Vue Router | Navigation between dashboards |
| Pinia | Reactive application state management |
| Node.js | Backend JavaScript runtime |
| Express | REST API and production frontend hosting |
| MongoDB Community Edition | Local database storage |
| Mongoose | Database schemas, validation, and indexing |
| CSS | Responsive dashboard styling |

### Application Features

**Student Management**
- Register students using name, student ID, phone number, and ZIP code.
- View all registered students.
- Search students by name, student ID, phone, or ZIP code.
- Delete students.
- Prevent duplicate student IDs.
- Automatically remove associated enrollments when a student is deleted.

**Course Management**
- Create university courses with a course ID and course name.
- View and search the course catalog.
- Delete courses.
- Prevent duplicate course IDs.
- Automatically remove associated enrollments when a course is deleted.

**Enrollment Management**
- Select existing students and courses from the database.
- Enroll students in courses.
- Prevent duplicate enrollments.
- View all current enrollment records.
- View students enrolled in a selected course.
- Remove individual enrollments without deleting the associated student or course.

**Additional Features**
- Responsive dashboard with navigation between application sections.
- Reusable Vue status message component.
- Form validation and success/error feedback.
- MongoDB persistent storage.
- Automatic initialization of Mongoose schemas and indexes on startup.
- Production Vue build served by Express.
- Support for direct navigation and refreshing Vue Router pages.

### Software Requirements

Install the following software before starting:

1. Node.js and npm.
2. MongoDB Community Edition, running locally.
3. A modern web browser.
4. Visual Studio Code or another code editor (optional).

The project was developed and tested using Node.js 24 and MongoDB 8.

### Project Structure

```text
cis3339-homework1/
│
├── backend/
│   ├── models/
│   │   ├── Student.js
│   │   ├── Course.js
│   │   └── Enrollment.js
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend-vue/
│   ├── src/
│   │   ├── components/
│   │   │   └── StatusMessage.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── stores/
│   │   │   ├── student.js
│   │   │   └── course.js
│   │   ├── views/
│   │   │   ├── StudentsView.vue
│   │   │   ├── CoursesView.vue
│   │   │   └── EnrollmentsView.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
├── images/
├── README.md
└── PROJECT_SETUP.md
```

The `frontend/` directory contains legacy starter files retained from the assignment. The completed application uses `frontend-vue/`.

### Environment Configuration

The backend uses a local MongoDB connection defined in `backend/.env`.

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

This configuration uses MongoDB Community Edition on the local computer and does not require database credentials for a standard local installation.

### Installation

**1. Clone or download the project.**

Open a terminal in the main project directory.

**2. Install backend dependencies.**

```bash
cd backend
npm install
```

**3. Install frontend dependencies.**

Return to the main project directory and install the Vue application dependencies.

```bash
cd ../frontend-vue
npm install
```

**4. Start MongoDB Community Edition.**

Ensure the local MongoDB service is running before starting the backend.

On Windows, MongoDB may be started from the Services application if it was installed as a Windows service.

A separate MongoDB database creation or manual collection setup is not required.

### Production Build and Startup

**1. Build the Vue frontend.**

From the `frontend-vue` directory:

```bash
npm run build
```

This creates the `frontend-vue/dist` directory containing the production frontend files.

**2. Start the Express backend.**

From the `backend` directory:

```bash
node server.js
```

The backend connects to MongoDB, initializes the required indexes, and serves the built Vue application.

Expected terminal output:

```text
Connected to MongoDB
Server running at http://localhost:3000
```

**3. Open the application.**

Visit:

- Students: http://localhost:3000/students
- Courses: http://localhost:3000/courses
- Enrollments: http://localhost:3000/enrollments

The frontend and backend are served from the same Express application on port 3000.

**Important:** MongoDB must be running, and the frontend must be built before accessing the production application.

### Development Mode

To run the Vue development server, start the backend first:

```bash
cd backend
node server.js
```

Open a second terminal:

```bash
cd frontend-vue
npm run dev
```

The Vue application is then available at:

http://localhost:5173

Vite forwards requests beginning with `/api` to the Express backend on port 3000.

### REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Retrieve students |
| POST | `/api/students` | Register student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/courses` | Retrieve courses |
| POST | `/api/courses` | Create course |
| DELETE | `/api/courses/:id` | Delete course |
| GET | `/api/enrollments` | Retrieve enrollments |
| POST | `/api/enrollments` | Create enrollment |
| GET | `/api/enrollments/course/:courseId` | View course roster |
| DELETE | `/api/enrollments/:id` | Remove enrollment |

The backend returns JSON responses and appropriate HTTP status codes for successful requests, validation errors, missing records, duplicate records, and server errors.

### Database Initialization

The backend connects to the database specified by `MONGO_URI`.

Mongoose initializes the Student, Course, and Enrollment models and their required indexes when the application starts.

If the specified database does not already exist, MongoDB creates the necessary database structures as data and indexes are written.

No manual database seeding, collection creation, or migration commands are required.

### Database Relationships and Data Integrity

The application uses three MongoDB models:

- **Student:** Stores student contact information and a unique student ID.
- **Course:** Stores course information and a unique course ID.
- **Enrollment:** Connects a Student record to a Course record using MongoDB ObjectId references.

A compound unique index prevents the same student from being enrolled in the same course more than once.

When a student or course is deleted through the application's API, associated enrollment records are also removed.

### Validation and Error Handling

The application validates required student and course fields before creating records.

The backend also checks that student and course selections exist before creating enrollments.

Duplicate IDs and enrollments are rejected with HTTP 409 responses. Invalid data and identifiers return HTTP 400 responses, and missing records return HTTP 404 responses.

A reusable `StatusMessage.vue` component displays success and error feedback across the application.

### Testing

The application was manually tested for:

- Student registration, listing, searching, and deletion.
- Course creation, listing, searching, and deletion.
- Enrollment creation, removal, and roster display.
- Duplicate prevention.
- Associated enrollment cleanup after deleting a student or course.
- Persistence of records after browser refresh.
- Vue Router navigation and direct page refreshes.
- Serving the production Vue build through Express.
- Starting with a fresh local MongoDB database.
- Restoring and reconnecting to the original MongoDB database.

### Submission Notes

The Git repository includes application source code, package manifests, package lock files, documentation, and the local MongoDB `.env` configuration required by the assignment.

The repository should not include:

- `node_modules` directories.
- Production build output (`dist`).
- Personal credentials or private access tokens.
- Unnecessary temporary files.

The production build can be recreated with `npm install` and `npm run build`.

### Course Information

**Course:** CIS 3339 — Enterprise Applications Development  
**Assignment:** Homework 1 — Vue 3 and MongoDB Migration  
**Semester:** Fall 2026  
**Institution:** University of Houston