# Project: IELTS Smart Reading

## Project Overview

This is a Next.js application designed for IELTS reading practice. It provides an enhanced reading experience with lexical analysis and interactive features. The application dynamically loads reading passages from the `data` directory and displays them in a user-friendly interface. The frontend is built with React, Next.js, and a rich set of UI components from Radix UI.

## Building and Running

To get started with the development environment, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

*   **Build for production:**
    ```bash
    npm run build
    ```

*   **Start the production server:**
    ```bash
    npm run start
    ```

*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Framework:** The project is built with [Next.js](https://nextjs.org/).
*   **UI Components:** The UI is built using [Radix UI](https://www.radix-ui.com/) and custom components.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) is used for styling.
*   **Data:** Reading passages and related data are stored in the `data` directory, organized by book and test number.
*   **Routing:** The main application is under the `/reading` route.
