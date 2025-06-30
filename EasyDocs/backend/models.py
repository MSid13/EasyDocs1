from sqlalchemy import Column, Integer, String, ForeignKey, Text, Enum, create_engine, Boolean
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import enum

Base = declarative_base()

class RoleEnum(enum.Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)  # Added for password auth
    docs = relationship('DocPermission', back_populates='user')

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    permissions = relationship('DocPermission', back_populates='document')

class DocPermission(Base):
    __tablename__ = 'doc_permissions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    doc_id = Column(Integer, ForeignKey('documents.id'))
    role = Column(Enum(RoleEnum), nullable=False)
    user = relationship('User', back_populates='docs')
    document = relationship('Document', back_populates='permissions')

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message = Column(String, nullable=False)
    dismissed = Column(Boolean, default=False)

# DB setup
engine = create_engine('sqlite:///easydocs.db', connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(engine)

def ensure_admin():
    from passlib.hash import bcrypt
    session = SessionLocal()
    admin = session.query(User).filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', password_hash=bcrypt.hash('admin123'))
        session.add(admin)
        session.commit()
    session.close()

ensure_admin()
