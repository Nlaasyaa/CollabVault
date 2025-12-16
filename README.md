<div align="center">

  <h1>📼 CollabVault</h1>
  
  <p>
    <strong>Connect. Collaborate. Create.</strong>
  </p>
  
  <p>
    The ultimate retro-industrial hub for tech innovators to find their squad and build the future.
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
  ![Status](https://img.shields.io/badge/status-active-success.svg?style=flat-square)

</div>

---

## About CollabVault

**CollabVault** is not just another networking platform; it's a digital ecosystem designed for students, developers, and innovators to find teammates, showcase their skills, and bridge the gap between ideas and reality. 

Wrapped in a **distinctive retro-industrial VHS aesthetic**, CollabVault brings a unique flavor to professional networking. Whether you are looking for a hackathon partner, a co-founder, or just a study buddy, CollabVault has the tools to make it happen.

## Key Features

### Networking & Connections
- **Smart Recommendations:** Algorithm-driven suggestions to find the perfect teammates based on skills and interests.
- **Connection Requests:** seamless invite system to build your professional circle.
- **Swipe to Connect:** A dynamic interface to discover potential collaborators.

### Real-Time Communication
- **Instant Messaging:** Powered by **Socket.io** for low-latency chatting.
- **Team Chats:** Dedicated group spaces for your projects and squads.
- **One-on-One DM:** Private channels for direct collaboration.

### Capabilities
- **Dynamic Feed:** Share updates, project milestones, and thoughts with the community.
- **Interactive Posts:** Like, comment, and engage with content.
- **Announcements:** Stay updated with platform-wide news.

### User Experience
- **Retro-Industrial UI:** A stunning dark-mode interface inspired by 80s/90s VHS packaging and industrial design.
- **Comprehensive Profiles:** Showcase your college, branch, bio, skills, and interests.
- **Admin Dashboard:** Powerful tools for community management.

---

## Tech Stack

CollabVault is built with a robust, modern technology stack ensuring performance, scalability, and developer experience.

### **Frontend**
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/) / Radix Primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms:** React Hook Form + Zod

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** MySQL
- **Real-time:** [Socket.io](https://socket.io/)
- **Authentication:** JWT (JSON Web Tokens) & BCrypt
- **Email:** Nodemailer

---

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**
- **MySQL** installed and running

### 1. Clone the Repository

```bash
git clone https://github.com/Nlaasyaa/CollabVault.git
cd CollabVault
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` folder with the following credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=collabvault_db
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
# The server will run on http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal, navigate to the Frontend directory, and install dependencies:

```bash
cd Frontend
npm install
```

Start the development server:
```bash
npm run dev
# The app will run on http://localhost:3000
```

---

## Future Roadmap

- [ ] Mobile Application (React Native)
- [ ] AI-powered Project Matching
- [ ] GitHub Integration for Portfolios
- [ ] Video Call Integration

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
>
