from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import User, Document, DocPermission, RoleEnum, SessionLocal, Alert
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from typing import List
from passlib.hash import bcrypt
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROUTES ---

@app.post("/api/docs/{doc_id}/save")
async def save_doc(doc_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    user_id = data.get("user_id")
    content = data.get("content")
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).first()
    if not perm or perm.role not in [RoleEnum.owner, RoleEnum.editor]:
        return JSONResponse({"error": "No edit access"}, status_code=403)
    doc = db.query(Document).get(doc_id)
    doc.content = content
    db.commit()
    return {"success": True}



@app.post("/api/signup")
async def signup(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return JSONResponse({"error": "Username and password required"}, status_code=400)
    if len(password) < 3:
        return JSONResponse({"error": "Password must be at least 3 characters"}, status_code=400)
    if db.query(User).filter_by(username=username).first():
        return JSONResponse({"error": "Username already exists"}, status_code=400)
    user = User(username=username, password_hash=bcrypt.hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": True, "username": username, "user_id": user.id}

@app.post("/api/login")
async def login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return JSONResponse({"error": "Username and password required"}, status_code=400)
    if len(password) < 3:
        return JSONResponse({"error": "Password must be at least 3 characters"}, status_code=400)
    user = db.query(User).filter_by(username=username).first()
    if not user or not bcrypt.verify(password, user.password_hash):
        return JSONResponse({"error": "Invalid username or password"}, status_code=401)
    return {"success": True, "username": username, "user_id": user.id}


@app.get("/api/docs")
async def get_docs(user_id: int, db: Session = Depends(get_db)):
    perms = db.query(DocPermission).filter_by(user_id=user_id).all()
    docs = [db.query(Document).get(p.doc_id) for p in perms]
    return [{"id": d.id, "title": d.title, "role": p.role.value} for d, p in zip(docs, perms)]

@app.post("/api/docs")
async def create_doc(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    title = data.get("title", "Untitled")
    user_id = data.get("user_id")
    if not user_id:
        return JSONResponse({"error": "user_id required"}, status_code=400)
    doc = Document(title=title, content="")
    db.add(doc)
    db.commit()
    db.refresh(doc)
    perm = DocPermission(user_id=user_id, doc_id=doc.id, role=RoleEnum.owner)
    db.add(perm)
    db.commit()
    return {"id": doc.id, "title": doc.title, "role": perm.role.value}

@app.get("/api/docs/{doc_id}")
async def get_doc(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).first()
    if not perm:
        return JSONResponse({"error": "No access"}, status_code=403)
    doc = db.query(Document).get(doc_id)
    return {"id": doc.id, "title": doc.title, "content": doc.content, "role": perm.role.value}

@app.post("/api/docs/{doc_id}/share")
async def share_doc(doc_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    target_username = data.get("username")
    role = data.get("role")
    user_id = data.get("user_id")
    # Only owner can share
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id, role=RoleEnum.owner).first()
    if not perm:
        return JSONResponse({"error": "Only owner can share"}, status_code=403)
    target_user = db.query(User).filter_by(username=target_username).first()
    if not target_user:
        return JSONResponse({"error": "User not found"}, status_code=404)
    existing = db.query(DocPermission).filter_by(user_id=target_user.id, doc_id=doc_id).first()
    if existing:
        existing.role = RoleEnum(role)
    else:
        db.add(DocPermission(user_id=target_user.id, doc_id=doc_id, role=RoleEnum(role)))
    db.commit()
    return {"success": True}

@app.post("/api/docs/{doc_id}/remove")
async def remove_doc_permission(doc_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    target_username = data.get("username")
    user_id = data.get("user_id")
    # Allow editors/viewers to remove themselves
    user = db.query(User).filter_by(id=user_id).first()
    if user and user.username == target_username:
        # User is removing themselves
        perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).first()
        if not perm or perm.role == RoleEnum.owner:
            return JSONResponse({"error": "Owner cannot leave their own document"}, status_code=403)
        db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).delete()
        db.commit()
        return {"success": True}
    # Only owner can remove others
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id, role=RoleEnum.owner).first()
    if not perm:
        return JSONResponse({"error": "Only owner can remove users"}, status_code=403)
    target_user = db.query(User).filter_by(username=target_username).first()
    if not target_user:
        return JSONResponse({"error": "User not found"}, status_code=404)
    if target_user.username == 'admin':
        return JSONResponse({"error": "Cannot remove admin from docs"}, status_code=403)
    db.query(DocPermission).filter_by(user_id=target_user.id, doc_id=doc_id).delete()
    db.commit()
    return {"success": True}

@app.delete("/api/docs/{doc_id}")
async def delete_doc(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id, role=RoleEnum.owner).first()
    if not perm:
        logging.warning(f"User {user_id} tried to delete doc {doc_id} without permission.")
        return JSONResponse({"error": "Only owner can delete"}, status_code=403)
    db.query(DocPermission).filter_by(doc_id=doc_id).delete()
    db.query(Document).filter_by(id=doc_id).delete()
    db.commit()
    logging.info(f"Document {doc_id} deleted by user {user_id}.")
    return {"success": True}

@app.delete("/api/admin/delete_user")
async def admin_delete_user(username: str, admin_user: str, admin_pass: str, db: Session = Depends(get_db)):
    admin = db.query(User).filter_by(username='admin').first()
    from passlib.hash import bcrypt
    if not admin or not bcrypt.verify(admin_pass, admin.password_hash) or admin_user != 'admin':
        logging.warning(f"Failed admin delete attempt for {username} by {admin_user}.")
        return JSONResponse({"error": "Admin authentication failed"}, status_code=403)
    if username == 'admin':
        return JSONResponse({"error": "Cannot delete admin account"}, status_code=403)
    target = db.query(User).filter_by(username=username).first()
    if not target:
        return JSONResponse({"error": "User not found"}, status_code=404)
    db.query(DocPermission).filter_by(user_id=target.id).delete()
    db.query(User).filter_by(username=username).delete()
    db.commit()
    logging.info(f"Admin deleted user {username}.")
    return {"success": True}

@app.get("/api/docs/{doc_id}/collaborators")
async def get_collaborators(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).first()
    if not perm:
        return JSONResponse({"error": "No access to this document"}, status_code=403)
    perms = db.query(DocPermission).filter_by(doc_id=doc_id).all()
    users = db.query(User).all()
    user_map = {u.id: u.username for u in users}
    return [{"username": user_map[p.user_id], "role": p.role.value} for p in perms]

connections = {}

@app.websocket("/ws/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: int):
    await websocket.accept()
    if doc_id not in connections:
        connections[doc_id] = []
    connections[doc_id].append(websocket)
    from sqlalchemy.orm import Session
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            # Expecting: {"user_id":..., "content":...}
            user_id = data.get("user_id")
            content = data.get("content")
            perm = db.query(DocPermission).filter_by(user_id=user_id, doc_id=doc_id).first()
            if not perm or perm.role not in [RoleEnum.owner, RoleEnum.editor]:
                await websocket.send_json({"error": "No edit access"})
                continue
            doc = db.query(Document).get(doc_id)
            doc.content = content
            db.commit()
            # Broadcast to all other clients
            for conn in connections[doc_id]:
                if conn != websocket:
                    await conn.send_json({"docId": doc_id, "content": content})
    except WebSocketDisconnect:
        connections[doc_id].remove(websocket)
    finally:
        db.close()

@app.post("/api/admin/send_alert")
async def admin_send_alert(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    admin_user = data.get("admin_user")
    admin_pass = data.get("admin_pass")
    target_username = data.get("username")
    message = data.get("message")
    admin = db.query(User).filter_by(username='admin').first()
    from passlib.hash import bcrypt
    if not admin or not bcrypt.verify(admin_pass, admin.password_hash) or admin_user != 'admin':
        return JSONResponse({"error": "Admin authentication failed"}, status_code=403)
    target = db.query(User).filter_by(username=target_username).first()
    if not target:
        return JSONResponse({"error": "User not found"}, status_code=404)
    alert = Alert(user_id=target.id, message=message, dismissed=False)
    db.add(alert)
    db.commit()
    return {"success": True}

@app.get("/api/user/alerts")
async def get_user_alerts(user_id: int, db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter_by(user_id=user_id, dismissed=False).all()
    return [{"id": a.id, "message": a.message} for a in alerts]

@app.post("/api/user/alerts/dismiss")
async def dismiss_alert(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    alert_id = data.get("alert_id")
    user_id = data.get("user_id")
    alert = db.query(Alert).filter_by(id=alert_id, user_id=user_id).first()
    if alert:
        alert.dismissed = True
        db.commit()
    return {"success": True}

@app.post("/api/admin/user_credentials")
async def admin_user_credentials(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    admin_user = data.get("admin_user")
    admin_pass = data.get("admin_pass")
    target_username = data.get("username")
    admin = db.query(User).filter_by(username='admin').first()
    from passlib.hash import bcrypt
    if not admin or not bcrypt.verify(admin_pass, admin.password_hash) or admin_user != 'admin':
        return JSONResponse({"error": "Admin authentication failed"}, status_code=403)
    target = db.query(User).filter_by(username=target_username).first()
    if not target:
        return JSONResponse({"error": "User not found"}, status_code=404)
    # WARNING: This is insecure and for demo only!
    return {"username": target.username, "password_hash": target.password_hash}

@app.post("/api/admin/view_user_docs")
async def admin_view_user_docs(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    admin_user = data.get("admin_user")
    admin_pass = data.get("admin_pass")
    target_username = data.get("username")
    admin = db.query(User).filter_by(username='admin').first()
    from passlib.hash import bcrypt
    if not admin or not bcrypt.verify(admin_pass, admin.password_hash) or admin_user != 'admin':
        return JSONResponse({"error": "Admin authentication failed"}, status_code=403)
    target = db.query(User).filter_by(username=target_username).first()
    if not target:
        return JSONResponse({"error": "User not found"}, status_code=404)
    # Get all docs for this user (with their content)
    perms = db.query(DocPermission).filter_by(user_id=target.id).all()
    docs = [db.query(Document).get(p.doc_id) for p in perms]
    result = []
    for d in docs:
        if d:
            result.append({"id": d.id, "title": d.title, "content": d.content})
    return {"docs": result}

@app.post("/api/change_password")
async def change_password(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")
    old_password = data.get("old_password")
    new_password = data.get("new_password")
    if not username or not old_password or not new_password:
        return JSONResponse({"error": "All fields required"}, status_code=400)
    user = db.query(User).filter_by(username=username).first()
    if not user or not bcrypt.verify(old_password, user.password_hash):
        return JSONResponse({"error": "Current password is incorrect"}, status_code=403)
    user.password_hash = bcrypt.hash(new_password)
    db.commit()
    return {"success": True, "message": "Password updated"}
