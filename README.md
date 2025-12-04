# Synchronous Chat App

## Welcome to the Synchronous Chat App!

Synchronous Chat App is a real-time chat application built with the MERN stack. It supports both direct messaging and group channels, making communication easy and fast. Users can create channels, send messages, and have an engaging chat experience.

**[Try the Live App Here!](https://mohammedsuhail364.github.io/ChatApp)**  
(Note: The server might respond slowly due to deployment on a free hosting platform.)

---

## Features
- **Real-time Messaging**: Instant messaging using WebSockets (Socket.io).
- **Direct Messages & Channels**: Chat with friends directly or create group channels for discussions.
- **User Profiles**: Display user profiles with customizable avatars and details.
- **Responsive UI**: A sleek and intuitive user interface designed for ease of use.
- **Authentication**: Secure user authentication using JWT and password encryption (bcrypt).
- **File Sharing**: Upload and share files in chats (coming soon).

---

## Technologies Used
- **Frontend**: React.js, HTML, CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time Communication**: Socket.io
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Token), bcrypt for password hashing
- **Version Control**: Git & GitHub

---

## Installation and Setup
Follow these steps to run the chat app locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/synchronous-chat-app.git
   cd synchronous-chat-app
   ```

2. **Install dependencies for both the frontend and backend**:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `backend` folder with the following details:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Start the backend and frontend servers**:
   Open two terminal windows:
   - Start the backend server:
     ```bash
     cd backend
     npm start
     ```
   - Start the frontend development server:
     ```bash
     cd frontend
     npm start
     ```

5. **Access the app**:
   Open your browser and navigate to `http://localhost:3000`.
