from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from pymongo import MongoClient
import os

load_dotenv()

MONGODB_URL      = os.getenv("MONGODB_URL")
QDRANT_URL       = os.getenv("QDRANT_URL")
QDRANT_API_KEY   = os.getenv("QDRANT_API_KEY")
EMBEDDING_MODEL  = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
COLLECTION_NAME  = os.getenv("COLLECTION_NAME", "users")
LLM_PROVIDER     = os.getenv("LLM_PROVIDER", "gemini").lower()
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL     = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-latest")

model   = SentenceTransformer(EMBEDDING_MODEL)
qdrant  = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)
mongo   = MongoClient(MONGODB_URL)
DB_NAME = os.getenv("MONGODB_DB_NAME", "complaint_db")  
db      = mongo[DB_NAME]                          
docs    = db["complaints"]