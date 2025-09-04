# Teacher-Student API

A RESTful API for managing teacher-student administrative functions built with Node.js, Express, and MySQL.

## 🚀 Hosted API

- **Live API**: `https://web-production-1f653.up.railway.app`
- **Health Check**: `GET https://web-production-1f653.up.railway.app/api/health`

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (>=14.0.0)
- MySQL (>=8.0)
- npm (>=6.0.0)

### Installation

```bash
git clone <repository-url>
cd teacher-student-api
npm install
```

### Database Setup

```sql
CREATE DATABASE teacher_student_db;
CREATE DATABASE teacher_student_test_db;
mysql -u root -p < database/schema.sql
```

### Environment Configuration

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=teacher_student_db
```

### Start the Server

```bash
npm start
```

API will be available at: `http://localhost:3000`

### Run Tests

```bash
npm test
```

## 📋 API Endpoints

| Method | Endpoint                        | Description                      | Status Code |
| ------ | ------------------------------- | -------------------------------- | ----------- |
| `POST` | `/api/register`                 | Register students to a teacher   | 204         |
| `GET`  | `/api/commonstudents`           | Get common students for teachers | 200         |
| `POST` | `/api/suspend`                  | Suspend a student                | 204         |
| `POST` | `/api/retrievefornotifications` | Get notification recipients      | 200         |

## 📚 API Documentation

### 1. Register Students to Teacher

**Endpoint**: `POST /api/register`

**Headers**: `Content-Type: application/json`

**Request Body**:

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

**Success Response**: `204 No Content`

### 2. Get Common Students

**Endpoint**: `GET /api/commonstudents`

**Query Parameters**:

- `teacher` (required): Teacher email (can specify multiple)

**Examples**:

```
GET /api/commonstudents?teacher=teacherken%40gmail.com
GET /api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com
```

**Success Response**: `200 OK`

```json
{
  "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"]
}
```

### 3. Suspend Student

**Endpoint**: `POST /api/suspend`

**Headers**: `Content-Type: application/json`

**Request Body**:

```json
{
  "student": "studentmary@gmail.com"
}
```

**Success Response**: `204 No Content`

### 4. Retrieve Notification Recipients

**Endpoint**: `POST /api/retrievefornotifications`

**Headers**: `Content-Type: application/json`

**Request Body**:

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

**Success Response**: `200 OK`

```json
{
  "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"]
}
```

**Notification Rules**:

- Students must NOT be suspended
- Students receive notifications if they are:
  - Registered with the teacher, OR
  - @mentioned in the notification text (format: @email@domain.com)

### Error Responses

All endpoints return error responses with:

- Appropriate HTTP status code (400, 404, 500)
- JSON body with meaningful error message:

```json
{
  "message": "Some meaningful error message"
}
```

## 🛠 Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL 8.0+
- **Testing**: Jest + Supertest
- **Validation**: Joi schemas
- **Security**: Helmet.js, CORS protection
- **Code Quality**: ESLint, Prettier

## 📁 Project Structure

```
src/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── services/         # Business logic
├── repositories/     # Data access layer
├── middlewares/      # Express middlewares
├── routes/           # API routes
├── validators/       # Input validation
└── utils/            # Helper functions
tests/                # Test suites
database/             # Database schema
```

## 🔧 Development

### Available Scripts

```bash
npm start            # Start production server
npm run dev          # Start development server (with nodemon)
npm test             # Run tests with coverage
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Database Schema

```sql
-- Teachers table
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher-Student relationships
CREATE TABLE teacher_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE KEY unique_teacher_student (teacher_id, student_id)
);
```

## 🧪 Testing with Postman

A Postman collection (`postman_collection.json`) is included for API testing:

1. Import the collection into Postman
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Run the requests in order for complete testing

## 🎯 Design Decisions

1. **Layered Architecture**: Separation of concerns with Controllers, Services, and Repositories
2. **Raw SQL vs ORM**: Used raw SQL for performance and to demonstrate SQL expertise
3. **Repository Pattern**: Database abstraction for better testability
4. **Input Validation**: Joi schemas for robust validation
5. **Error Handling**: Comprehensive error handling with meaningful messages
6. **Security**: Multiple layers including input validation, SQL injection prevention

## 📝 Assessment Notes

This API was developed following the requirements:

- ✅ Node.js backend with Express
- ✅ MySQL database with proper schema
- ✅ All 4 required endpoints implemented
- ✅ Unit tests with good coverage
- ✅ Proper error handling and validation
- ✅ Adherence to specified API contracts
- ✅ Clean, readable, and well-structured code

The solution demonstrates enterprise-level practices suitable for production use while maintaining simplicity and performance.
