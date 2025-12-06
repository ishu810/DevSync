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

def upsert_vector(doc: dict):
    mongo_id = doc["_id"]
    point_id = str(uuid.uuid4())          

    text = get_searchable_text(doc)       
    if not text:
        return

    vector = model.encode(text).tolist()

    point = PointStruct(
        id=point_id,
        vector=vector,
        payload={
            "doc_id": str(mongo_id),
            
            "filename": doc.get("title", "Untitled Complaint"),
            
            "user": str(doc.get("submitted_by", "unknown")),
            
            # 3. Store extra metadata (useful if you want to filter by these later)
            "category": doc.get("category", "General"),
            "priority": doc.get("priority", "Low"),
            "status": doc.get("status", "Open"),
            "assigned_to": str(doc.get("assigned_to", ""))
        }
    )

    qdrant.upsert(collection_name=COLLECTION_NAME, points=[point])
    logger.info(f"Synced → {mongo_id} | {doc.get('title', 'Untitled')}")

def delete_vector(doc_id: str):
    qdrant.delete(collection_name=COLLECTION_NAME, points_selector=[doc_id])
    logger.info(f"Deleted vector → {doc_id}")

def handle_change(change):
    op = change["operationType"]
    doc_id_str = str(change["documentKey"]["_id"])

    if op in ["insert", "update", "replace"]:
        full_doc = change.get("fullDocument")
        if not full_doc:
            full_doc = docs.find_one({"_id": ObjectId(doc_id_str)})
        if full_doc:
            upsert_vector(full_doc)

    elif op == "delete":
        delete_vector(doc_id_str)

def start_sync():
    logger.info("Starting real-time sync: complaint_db.complaints → Qdrant")
    resume_token = None
    while True:
        try:
            with docs.watch(resume_after=resume_token) as stream:
                for change in stream:
                    resume_token = stream.resume_token
                    threading.Thread(target=handle_change, args=(change,), daemon=True).start()
        except Exception as e:
            logger.error(f"Change stream error: {e}. Reconnecting in 5s...")
            time.sleep(5)

def run_background_sync():
    thread = threading.Thread(target=start_sync, daemon=True)
    thread.start()
    logger.info("Qdrant sync is running in background")