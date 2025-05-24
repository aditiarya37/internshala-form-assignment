# Internshala Multi-Page Form Application

A full-stack web application for multi-step form submissions, built with **React (Vite)** on the frontend and **Node.js (Express + Prisma + MongoDB)** on the backend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Form Pages & Fields](#form-pages--fields)
- [Validation](#validation)
- [Images / Screenshots](#images--screenshots)
- [License](#license)

---

## Project Overview

This project is an internship assignment for Internshala, designed to demonstrate skills in building a robust, user-friendly, and validated multi-page form. It includes user authentication, persistent form data, and both client-side and server-side validation.

---

## Features

- Multi-step form (Personal Info, Education, Projects)
- User authentication (register, login, logout)
- Save progress as draft and resume later
- Dynamic project entry (add/remove projects)
- Client-side and server-side validation
- Data persistence with MongoDB (via Prisma ORM)
- Clean, responsive UI with [shadcn/ui](https://ui.shadcn.com/) components and Tailwind CSS

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, Prisma ORM, MongoDB (Atlas or local)
- **Validation:** express-validator (backend), custom logic (frontend)
- **Authentication:** JWT, bcryptjs, cookie-based sessions

---

## Folder Structure

internshala-form/
├── internshala-form-backend/      # Backend (Node.js, Express, Prisma)
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   ├── server.js
│   └── package.json
├── internshala-form-frontend/     # Frontend (React, Vite)
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md


---

## Getting Started

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd internshala-form-backend
   npm install
   ```

2. **Configure environment variables:**
	- Create a .env file with:
	```bash
   PORT=5000
   DATABASE_URL="your_mongodb_connection_string" 
   JWT_SECRET="your_jwt_secret"
   ```	

3. **Generate Prisma client:**

	```bash
   npx prisma generate
   ```

4. **Start the backend server:**
	```bash
	npm run dev
	```
	The server runs on http://localhost:5000/.


### Frontend Setup

1. **Install dependencies:**
	```bash
	cd internshala-form-frontend
	npm install
	```
2. **Start the frontend dev server:**
	```bash
	npm run dev
	```
	The app runs on http://localhost:5173/ (default Vite port).
	

## API Endpoints

### User Authentication
- **POST** /api/users/register — Register a new user
- **POST** /api/users/login — Login
- **POST** /api/users/logout — Logout
- **GET** /api/users/profile — Get current user profile (auth required)

### Applications
- **POST** /api/applications — Create or update an application (auth required)
- **GET** /api/applications — Get all applications for the logged-in user
- **GET** /api/applications/:id — Get a specific application (auth required)
- **DELETE** /api/applications/:id — Delete an application (auth required)


## Form Pages & Fields
1. **Personal Information**
	- Name, Email, Address Line 1, Address Line 2 (optional), City, State, Zipcode
	
2. **Educational Status**
	- Are you still studying? (Yes/No)
	- **If Yes:** Where are you studying?

3. **Projects**
	- **Dynamic list:** Project Name, Project Description (add/remove as needed)

## Validation
- **Client-side:** All fields validated before submission (required, email format, zipcode, etc.)
- **Server-side:** All data validated again using express-validator before saving to the database

## Images / Screenshots
> Here's how ***Internshala Form*** looks in action.

<table>
  <tr>
    <th>Login</th>
    <th>Signup</th>
  </tr>
  <tr>
    <td><img src="/screenshots/Login.jpeg" width="500" alt="Login" /></td>
    <td><img src="/screenshots/Signup.jpeg" width="500" alt="Signup" /></td>
  </tr>
  <tr>
    <th colspan="2">Homepage</th>
  </tr>
  <tr>
    <td colspan="2">
      <img src="/screenshots/Home_Page.jpeg" width="1000" alt="Home Page" />
    </td>
  </tr>
  <tr>
  <th>Personal Details</th>
  <th>Educational Background</th>
  </tr>
  <tr>
  <td>
  <img src="/screenshots/Personal_Details.jpeg" width="500" alt="Personal Details" />
  </td>
  <td>
  <img src="/screenshots/Educational_Background.jpeg" width="500" alt="Educational Background" />
  </td>
  </tr>
  <tr>
  <th>Projects & Experience</th>
  <th>Application Submitted</th>
  </tr>
  <tr>
  <td>
  <img src="/screenshots/Projects_And_Experience.jpeg" width="500" alt="Projects & Experience" />
  </td>
  <td>
  <img src="/screenshots/Application_Submitted.jpeg" width="500" alt="Application Submitted" />
  </td>
  </tr>
  <tr>
    <th colspan="2">My Applications</th>
  </tr>
  <tr>
    <td colspan="2">
      <img src="/screenshots/My_Applications.jpeg" width="1000" alt="My Applications" />
    </td>
  </tr>
</table>



## License
This project is for educational and assignment purposes.

## Credits
- UI components:  [shadcn/ui](https://ui.shadcn.com/)
- Icons: [lucide-react](https://lucide.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- ORM: [Prisma](https://www.prisma.io/)

---

Made with ❤️ by [Aditi Arya]((https://aditiarya.netlify.app/))