# EasyDocs

EasyDocs is a real-time collaborative document editing platform featuring conflict management, multi-user support, and print capabilities. Built with FastAPI and WebSockets, it enables seamless collaboration and robust document handling.

## Features

- **Real-time Collaboration:** Multiple users can edit documents simultaneously.
- **Conflict Management:** Handles concurrent edits gracefully.
- **Multi-user Support:** Invite and collaborate with others.
- **Print Support:** Easily print your documents.
- **Admin Panel:** Manage users and documents. (Username: "admin", Password: "admin123")

## How It Works

### Real-time Editing

EasyDocs uses WebSockets and the [yws-server](https://github.com/yjs/y-websocket) (Yjs WebSocket server) to enable real-time collaborative editing. When users edit a document, their changes are instantly synchronized across all connected clients. This is achieved by:

- Maintaining a shared document state using Yjs, a CRDT (Conflict-free Replicated Data Type) library.
- Broadcasting changes via WebSocket connections to all participants.
- Applying remote updates in real time, so all users see edits as they happen.

### Conflict Management

Conflict management is handled automatically by Yjs. When multiple users make changes at the same time:

- Yjs merges concurrent edits using CRDT algorithms, ensuring that all changes are preserved and the document remains consistent.
- There is no need for manual conflict resolution or locking; the system guarantees eventual consistency.
- The backend (FastAPI) and yws-server coordinate to persist document state and manage user sessions securely.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, aiosqlite, WebSockets
- **Frontend:** JavaScript (details in frontend directory)
- **Realtime Engine:** yws-server

## Prerequisites


- **Python 3.8+**
- **Node.js 14+** and **npm**
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EasyDocs.git
cd EasyDocs
```

### 2. Backend Setup

```bash
cd backend
```

- **Install Python dependencies:**
  ```bash
  pip install -r requirements.txt
  ```
  Or manually:
  ```bash
  pip install fastapi uvicorn python-multipart sqlalchemy aiosqlite 'passlib[bcrypt]'
  ```

- **(Optional) Set up environment variables:**  
  Create a `.env` file for custom configuration.

### 3. Frontend Setup

```bash
cd ../frontend
```

- **Install JavaScript dependencies:**
  ```bash
  npm install
  ```
  *(Dependencies are listed in `frontend/package.json`.)*


## Usage

### 1. Start the Backend API

From the `backend` directory, run:

```bash
uvicorn main:app --host 0.0.0.0 --port 4000
```
- The backend API will be available at [http://localhost:4000](http://localhost:4000)
- You may use a different port if desired, but ensure the frontend API URLs match.

### 2. Start the Yjs WebSocket Server (for Real-Time Collaboration)

From the project root (or any directory), run:

```bash
npx y-websocket-server --port 1234
```
- This enables real-time collaborative editing. The frontend expects this server at `ws://localhost:1234`.
- If you do not need real-time features, you may skip this step.

### 3. Start the Frontend

From the `frontend` directory, run:

```bash
npm start
```
- The frontend will be available at [http://localhost:3000](http://localhost:3000) by default.
- The frontend is configured to talk to the backend at port 4000. (can be changed!)

### 4. Access the Admin Panel

- Log in with your credentials.
- Default credentials:
  - **Username:** `admin`
  - **Password:** `admin123`
- **Important:** Change these credentials immediately after setup for better security. Go to "manage_db.py" for information on changing the admin password. 
- The admin panel allows you to manage users, documents, and monitor collaboration activity.

---

## Troubleshooting & Tips

- **Dependencies:** Ensure your Python and Node.js versions meet the prerequisites.
- **Database errors:** Delete the local SQLite file (`easydocs.db`) and restart the backend if you encounter issues.
- **CORS issues:** Check your backend's CORS settings in `main.py`.
- **Real-time sync:** Make sure the yws-server is running and accessible at `ws://localhost:1234`.
- **Frontend build errors:** Clear `node_modules` and run `npm install` again.
- **API errors (404/connection refused):** Ensure the backend is running on the correct port (`4000`) and the frontend is configured to use the same port for API calls.
- **WebSocket disconnects:** Verify your network/firewall settings and server logs.
- **Debugging:** Check browser console and backend logs for detailed error messages.

---

## Quick Start (All in One)

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 4000

# Terminal 2: Yjs WebSocket Server (for real-time collaboration)
npx y-websocket-server --port 1234

# Terminal 3: Frontend
cd frontend
npm start
```

---

## Community & Support

- For questions, suggestions, or help, open a [GitHub Issue](https://github.com/MSid13/EasyDocs/issues).


## Notes
 
### Database Management (manage_db.py)

The `backend/manage_db.py` script is a powerful admin tool for inspecting, backing up, and managing your EasyDocs database.

**Key features:**
- View all tables and their contents
- Add, remove, or update users (with bcrypt password hashing)
- Change user passwords
- Wipe all data (with confirmation prompt)
- Automatic database backup before any changes

**Usage:**
1. Open `backend/manage_db.py` in a text editor.
2. Uncomment the section you need (e.g., change password, add/remove user, wipe data).
3. Edit parameters as needed (e.g., username/password).
4. Run: `python manage_db.py`
5. Comment the section again after use.

**Safety:**
- The script always creates a timestamped backup before making changes.
- Destructive actions (like deleting all data) require explicit confirmation.
- See comments in the script for more details and safety tips.

**Example:**

(The code is inside the manage_db.py for this action- no need to copy)

```python
# Change admin password
username = "admin"
new_password = "your_new_password"
change_user_password(cursor, username, new_password)
conn.commit()
```


## License

This project is licensed under a **Custom Attribution License**.

**You are free to:**
- Use, modify, and distribute this software for commercial and non-commercial purposes.

**Attribution Requirements:**
- You **must** clearly display:
  - The original project name: **EasyDocs**
  - A link to the original GitHub repository: [https://github.com/MSid13/EasyDocs](https://github.com/MSid13/EasyDocs)
- Attribution must appear in any distributed or derivative work, whether in source or binary form, and in any documentation, about section, or credits. The attribution must be reasonably visible, such as in a footer, at a legible font size and appropriate color. 

**No other restrictions apply.**

**Example of attribution:**
> Original Project ("EasyDocs") can be found at [https://github.com/MSid13/EasyDocs](https://github.com/MSid13/EasyDocs)

---

**Why this license?**  
This license ensures you have maximum freedom to use and build on EasyDocs, while giving credit to the original author and helping others discover the source.


---
