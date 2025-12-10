# CodeClash API Documentation

This document provides details on all available endpoints for the CodeClash API.

**Base URL**: `http://localhost:3000/api`

---

## Authentication

### 1. User Registration

*   **Endpoint**: `POST /auth/register`
*   **Description**: Registers a new user in the system.
*   **Request Body**:
    ```json
    {
      "username": "testuser",
      "email": "test@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "userId": "some_unique_user_id"
    }
    ```
*   **Error Response (400 Bad Request)**:
    ```json
    {
      "error": "Email already in use"
    }
    ```

### 2. User Login

*   **Endpoint**: `POST /auth/login`
*   **Description**: Authenticates a user and returns a JWT.
*   **Request Body**:
    ```json
    {
      "email": "test@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "token": "your_jwt_token_here"
    }
    ```
*   **Error Response (401 Unauthorized)**:
    ```json
    {
      "error": "Invalid credentials"
    }
    ```

---

## Problems

### 1. Get All Problems

*   **Endpoint**: `GET /problems`
*   **Description**: Retrieves a list of all available coding problems.
*   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "problem_1",
        "title": "Two Sum",
        "difficulty": "Easy"
      }
    ]
    ```
