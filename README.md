# NeuroBrain – Your Second Brain on the Web

NeuroBrain is a full-stack MERN-based web application designed to function as a digital second brain. It enables users to capture, organize, connect, and retrieve information efficiently through a clean and intuitive interface.

---

## Features

- Save notes, links, ideas, and resources in one place
- Visualize connections between data using an interactive graph view
- Organize content into structured collections
- AI-powered assistant for insights and suggestions
- Analytics dashboard to track usage and activity
- Secure authentication and authorization using JWT
- Chrome extension support for quick saving
- Share functionality for content distribution

---

## Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Other Tools
- JWT Authentication
- REST APIs
- Chrome Extension APIs

---

## Project Structure
second-brain/
│
├── Backend/
│ ├── src/
│ │ ├── controller/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── middleware/
│ │ └── config/
│ └── server.js
│
├── Frontend/
│ ├── src/
│ │ ├── App/
│ │ ├── Features/
│ │ └── assets/
│ └── vite.config.js
│
├── Extension/
│ ├── manifest.json
│ ├── popup.html
│ └── popup.js
│
└── README.md
---

## Installation and Setup

### Clone the Repository
```bash
git clone https://github.com/HemantMaru/second-brain.git
cd second-brain
Backend Setup
cd Backend
npm install
npm start
Frontend Setup
cd Frontend
npm install
npm run dev
Environment Variables

Create a .env file in the Backend folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
Screenshot
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/e899f8d5-f02a-41ac-946d-a556a499249c" />
Future Improvements
Real-time collaboration features
Advanced AI summarization
Drag and drop node connections
Improved mobile responsiveness
Cloud storage integration
Contributing

Contributions are welcome. Fork the repository and submit a pull request for any improvements.

Contact

Hemant Maru
Email: hemantkumawat399@gmail.com

LinkedIn: https://www.linkedin.com/in/hemant-maru-63012029a

License

This project is open-source and available under the MIT License.

Summary

NeuroBrain is built to enhance productivity by acting as a centralized knowledge management system, helping users think, organize, and learn more effectively.
