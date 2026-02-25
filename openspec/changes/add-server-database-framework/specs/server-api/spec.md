## ADDED Requirements

### Requirement: API route structure
The system SHALL support API routes using Next.js App Router pattern under `/app/api/`.

#### Scenario: API route directory structure
- **WHEN** API routes are created
- **THEN** they are placed under `/app/api/` directory
- **AND** each route has a `route.ts` file as the handler

#### Scenario: RESTful resource routes
- **WHEN** a resource API is created (e.g., posts)
- **THEN** routes follow RESTful conventions (`/api/posts`, `/api/posts/[id]`)
- **AND** HTTP methods are handled in the same `route.ts` file

### Requirement: CRUD operation handlers
The system SHALL support standard CRUD operations through API route handlers.

#### Scenario: GET all resources
- **WHEN** a GET request is made to a collection endpoint (e.g., `/api/posts`)
- **THEN** the system returns an array of resources
- **AND** the response status is 200

#### Scenario: GET single resource
- **WHEN** a GET request is made to a resource endpoint (e.g., `/api/posts/1`)
- **THEN** the system returns a single resource object
- **AND** the response status is 200 if found
- **AND** the response status is 404 if not found

#### Scenario: POST create resource
- **WHEN** a POST request is made to a collection endpoint with valid data
- **THEN** the system creates a new resource
- **AND** the response status is 201
- **AND** the response includes the created resource

#### Scenario: PUT update resource
- **WHEN** a PUT request is made to a resource endpoint with valid data
- **THEN** the system updates the resource
- **AND** the response status is 200 if successful
- **AND** the response status is 404 if not found

#### Scenario: DELETE resource
- **WHEN** a DELETE request is made to a resource endpoint
- **THEN** the system deletes the resource
- **AND** the response status is 204 if successful
- **AND** the response status is 404 if not found

### Requirement: Runtime configuration
The system SHALL configure API routes to use Node.js runtime (required for SQLite).

#### Scenario: Runtime is Node.js
- **WHEN** an API route using the database is created
- **THEN** the route exports `export const runtime = 'nodejs'`
- **AND** the route can access SQLite through `better-sqlite3`

### Requirement: Error handling
The system SHALL provide consistent error responses from API routes.

#### Scenario: Database error
- **WHEN** a database operation fails
- **THEN** the API returns a 500 status code
- **AND** the response includes an error message

#### Scenario: Validation error
- **WHEN** invalid request data is provided
- **THEN** the API returns a 400 status code
- **AND** the response includes validation error details

### Requirement: JSON request/response format
The system SHALL use JSON for all API request and response bodies.

#### Scenario: Accept JSON requests
- **WHEN** a request is made with `Content-Type: application/json`
- **THEN** the request body is parsed as JSON

#### Scenario: Return JSON responses
- **WHEN** an API route responds
- **THEN** the response has `Content-Type: application/json`
- **AND** the body is valid JSON

### Requirement: Database integration
The system SHALL allow API routes to access the database through the centralized client.

#### Scenario: Import database client
- **WHEN** an API route handler needs database access
- **THEN** it imports the database client from `@/lib/db`
- **AND** it can perform queries using Drizzle ORM

#### Scenario: Query within request handler
- **WHEN** an API request is received
- **THEN** the handler can query the database
- **AND** results are returned in the response
