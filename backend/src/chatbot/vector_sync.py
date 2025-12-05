import uuid
import logging
import threading
import time
from config import model, qdrant, docs, COLLECTION_NAME
from qdrant_client.models import PointStruct
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vector_sync")

def get_searchable_text(doc: dict) -> str:
    """
    Combine complaint fields into one context string for the LLM.
    """
    parts = [
        f"Title: {doc.get('title', '')}",
        f"Description: {doc.get('description', '')}",
        f"Category: {doc.get('category', '')}",
        f"Priority: {doc.get('priority', '')}",
        f"Status: {doc.get('status', '')}",
        f"Remarks: {doc.get('remarks', '')}"
    ]
    return " ".join(part for part in parts if part and not part.endswith(": ")).strip()