from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.routes.user import routes as user_router
from app.routes.post import routes as post_router
from app.schemas import base
from fastapi.middleware.cors import CORSMiddleware

from app.routes.conversation import routes as conversation_router
from app.routes.message import routes as message_router
from app.websocket.routes import router as websocket_router
from app.routes.room import routes as room_router



app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

base.metadata.create_all(bind=engine)



@app.get("/")
def root():
    return {
        "FastAPI running"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Development ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(post_router)
app.include_router(conversation_router)
app.include_router(message_router)
app.include_router(websocket_router)
app.include_router(room_router)