# Meetly - Video Conferencing Platform
A full-stack video conferencing platform enabling seamless video, audio, chat, and screen sharing. Users can start, join, and manage meetings with ease — even as guests, without signing up.

# Key Features
## ✅ User Authentication & State Management
- Secure login/signup with JWT authentication.
- Zustand for global state management ensuring smooth session handling & protected routes.
## ✅ Real-Time Communication
- WebRTC integration for live video, audio, and screen sharing.
- Socket.IO for event synchronization, chat, and participant updates in real time.
## ✅ Meeting Management
- Start new meetings or join existing ones.
- Participate as a guest without registration.
- Meeting history to track past meetings.
## ✅ Responsive UI
- Optimized for desktop and mobile devices.

# Tech Stack
- Frontend => React.js, Zustand
- Backend => Node.js, Express.js, MongoDB
- Real-Time Communication => WebRTC, Socket.IO
- Authentication => JWT

# Installation & Setup
1. Clone the Repository:
   ```bash
   https://github.com/Umang-Khemka/Meetly.git
2. Install the dependencies and build
   ```bash
   npm run build
3. Start the server
   ```bash
   npm start
4. Open http://localhost:3000/ in browser

# Usage
- Create a new meeting or join an existing meeting
- Participate as guest without signing up
- Chat, Share your screen, and manage participants in real time
- View your past meeting history

# Future Enhancements
- Add recording functionality for meetings
- Enable breakout rooms for smaller group discussion
- Integrate notifications for meeting reminders

