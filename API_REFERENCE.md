# CodeMatch REST & Socket API Reference

This document serves as the absolute technical reference for all REST API endpoints and real-time Socket.IO channels implemented on the CodeMatch platform.

---

## 1. Authentication Module

### Login Account
* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Authentication Required**: No
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "student1@codematch.com",
    "password": "studentpassword"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "d87f2ad6-e526-4860-83cc-60505edd58b8",
        "name": "Jane Doe",
        "email": "student1@codematch.com",
        "role": "STUDENT"
      }
    }
  }
  ```

---

## 2. Problems & Compilers Module

### Dry-run Solution
* **Method**: `POST`
* **URL**: `/api/submissions/run`
* **Authentication Required**: Yes (Bearer JWT token)
* **Request Body**:
  ```json
  {
    "problemId": "p-uuid-value",
    "code": "function solve() { ... }",
    "language": "javascript"
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ACCEPTED",
      "results": [
        { "input": "...", "expected": "...", "actual": "...", "passed": true }
      ]
    }
  }
  ```

---

## 3. Global Settings Module

### Get Profile Settings
* **Method**: `GET`
* **URL**: `/api/settings/profile`
* **Authentication Required**: Yes (Bearer JWT token)
* **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "id": "d87f2ad6-e526-4860-83cc-60505edd58b8",
      "name": "Jane Doe",
      "email": "student1@codematch.com",
      "bio": "Developer bio details",
      "college": "Stanford University",
      "department": "Computer Science",
      "academicYear": 4,
      "githubUrl": "https://github.com/janedoe",
      "linkedinUrl": "https://linkedin.com/in/janedoe",
      "leetcodeProfile": "janedoe"
    }
  }
  ```

### Save Settings Preferences
* **Method**: `PUT`
* **URL**: `/api/settings/preferences`
* **Authentication Required**: Yes (Bearer JWT token)
* **Request Body**:
  ```json
  {
    "theme": "dark",
    "accentColor": "blue",
    "fontSize": 14,
    "editorLanguage": "javascript",
    "editorTheme": "vs-dark",
    "editorFontSize": 14,
    "editorTabSize": 4,
    "editorWordWrap": true,
    "editorAutoSave": true,
    "editorLineNumbers": true,
    "editorMinimap": false
  }
  ```
* **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "id": "pref-uuid",
      "userId": "user-uuid",
      "theme": "dark",
      "editorLanguage": "javascript"
    }
  }
  ```

---

## 4. Socket.IO Real-Time Channels Reference

### Server-Emitted Broadcasts
* **`notification:new`**: Emitted when a new unread inbox alert is saved.
* **`receive_message`**: Dispatched to user room when a new message is received.
