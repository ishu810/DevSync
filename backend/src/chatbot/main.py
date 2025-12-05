from fastapi import FastAPI, Query
from contextlib import asynccontextmanager
from rag_search import answer_question
from vector_sync import run_background_sync

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("RAG service starting... Syncing MongoDB → Qdrant")
    run_background_sync()   # Starts the background sync thread
    yield
    print("RAG service stopped.")

app = FastAPI(
    lifespan=lifespan,
    title="RAG Chatbot – testdb.users → Qdrant → Gemini",
    description="Always-up-to-date semantic search over your MongoDB users"
)

@app.get("/ask")
async def ask(
    q: str = Query(..., description="Your question"),
    user: str = Query(None, description="Optional user filter")
):
    answer = answer_question(q, user)
    return {"answer": answer}

@app.get("/")
async def root():
    return {"status": "RAG service is running and fully synced!"}