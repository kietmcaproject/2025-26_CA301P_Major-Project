# CodeClash - Backend

This directory contains the source code for the CodeClash API server, built with Node.js and Express.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1.  Navigate to the `Backend` directory:
    ```sh
    cd Backend
    ```
2.  Install the required dependencies:
    ```sh
    npm install
    ```

### Running the Development Server

The server uses `nodemon` to automatically restart when file changes are detected.

1.  Start the server:
    ```sh
    nodemon index.js
    ```
2.  The API will be available at `http://localhost:3000` (or the port you configure).

**Recommendation:** For convenience, add a `start` script to your `package.json`:
```json
"scripts": {
  "start": "nodemon index.js"
}
```
You can then run the server with `npm start`.

