# Section Content to JSON Converter

This project is a Node.js-based application that processes HTML strings from a database and converts them into JSON. It uses TypeScript for improved type safety and scalability, Express for building APIs, and Swagger for API documentation.

## Features
- Convert individual or all HTML strings stored in a database to JSON.
- Provides detailed API documentation using Swagger.
- Dockerized for easy deployment.

---

## Prerequisites

- Node.js (v16 or later)
- npm
- Docker (optional for containerized deployment)
- SQL Server

---

## Installation

1. Clone the repository:
   ```bash
   git clone
   cd htmljson-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. `.env` file variables:
   ```env
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_SERVER=your_db_server
   DB_DATABASE=your_db_name
   DB_ENCRYPT=true
   PORT=3000
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the application:
   ```bash
   npm start
   ```

---

## Available Scripts

- `npm run dev`: Start the application in development mode using `nodemon`.
- `npm run build`: Compile the TypeScript code into JavaScript.
- `npm start`: Run the compiled application.

---

## APIs

### Convert All Records
- **Endpoint:** `GET /api/convert-all`
- **Description:** Converts all records in the database that have an HTML string but no JSON field.
- **Response:**
  - **200 OK:** "Database updated successfully!"
  - **500 Internal Server Error:** "An error occurred while processing the request."

### Convert a Single Record by ID
- **Endpoint:** `GET /api/convert/:id`
- **Description:** Converts a specific record identified by its ID.
- **Parameters:**
  - `id` (path): The ID of the record to convert.
- **Response:**
  - **200 OK:** "Record with ID {id} updated successfully!"
  - **404 Not Found:** "Record with ID {id} not found."
  - **500 Internal Server Error:** "An error occurred while processing the request."

---

## API Documentation

This project uses Swagger to document its APIs.

### Access the Documentation
Once the server is running, visit:
```
http://localhost:3000/api-docs
```

## Docker Usage

### Build the Docker Image
```bash
docker build -t htmljson-converter .
```

### Run the Docker Container
```bash
docker run -p 3000:3000 --env-file .env htmljson-converter
```

---

## Project Structure
```
htmljson-converter/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.ts
├── dist/                
├── package.json
├── tsconfig.json       
├── Dockerfile
├── .dockerignore
└── .env
```
