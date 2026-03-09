# GitHub Copilot Instructions — Teacher-Student API

## Project Overview
This is a RESTful API for managing teacher-student administrative functions.
- **Stack**: Node.js, Express.js, MySQL (raw SQL — no ORM), Jest + Supertest
- **Architecture**: Layered — Routes → Controllers → Services → Repositories
- **Validation**: Joi schemas in `src/validators/`
- **Security**: Helmet.js, input validation, parameterized SQL queries (NO string concatenation in SQL)
- **Error format**: Always `{ "message": "..." }` with appropriate HTTP code

## API Endpoints
| Method | Path | Status |
|--------|------|--------|
| POST | /api/register | 204 |
| GET | /api/commonstudents | 200 |
| POST | /api/suspend | 204 |
| POST | /api/retrievefornotifications | 200 |

## Coding Conventions
- **Always use async/await** — no callbacks or raw Promises
- **SQL**: Use parameterized queries with `?` placeholders — never template literals in SQL
- **Error handling**: Use `try/catch` in controllers, throw custom errors in services
- **Validation**: Joi schema in `src/validators/` for every endpoint's request body
- **Repository layer**: All DB queries go in `src/repositories/` — never in services or controllers
- **Response**: Controllers only call `res.status(X).json(...)` — no business logic
- **Naming**: camelCase for variables/functions, PascalCase for classes

## Test Conventions
- Test files in `tests/` using Jest + Supertest
- Each endpoint has its own test file: `tests/register.test.js`, etc.
- Use `beforeEach`/`afterEach` to clean DB state
- Test both success cases AND error cases (400, 404, 500)
- Mock DB calls using jest.mock() for unit tests

## File Structure Pattern
When adding a new feature, follow this pattern:
1. `src/validators/featureName.validator.js` — Joi schema
2. `src/repositories/featureName.repository.js` — SQL queries
3. `src/services/featureName.service.js` — business logic
4. `src/controllers/featureName.controller.js` — req/res handling
5. `src/routes/featureName.route.js` — Express router
6. `tests/featureName.test.js` — Jest + Supertest tests

## Security Rules (IMPORTANT for Copilot)
- NEVER use `eval()` or dynamic SQL string concatenation
- ALWAYS validate and sanitize email inputs with Joi
- ALWAYS use parameterized queries: `db.query('SELECT * FROM teachers WHERE email = ?', [email])`
- Sensitive data (DB credentials) must ONLY come from `process.env`
