from config import model, qdrant, docs, COLLECTION_NAME, GEMINI_API_KEY, GEMINI_MODEL
import requests
from bson import ObjectId
from qdrant_client import  models