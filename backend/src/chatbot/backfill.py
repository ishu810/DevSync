import uuid
from config import docs, model, qdrant, COLLECTION_NAME
from qdrant_client.models import PointStruct
from vector_sync import get_searchable_text
from qdrant_client import models

print(f"Backfilling {COLLECTION_NAME} → Qdrant with proper UUIDs...")

qdrant.recreate_collection(
    collection_name=COLLECTION_NAME, 
    vectors_config=models.VectorParams(
        size=384, 
        distance=models.Distance.COSINE
    )
)

count = 0
for doc in docs.find():
    mongo_id = doc["_id"]
    point_id = str(uuid.uuid4())        
    text = get_searchable_text(doc)    
    if not text.strip():
        continue

    vector = model.encode(text).tolist()

    point = PointStruct(
        id=point_id,
        vector=vector,
        payload={
            "doc_id": str(mongo_id),   
            
            "filename": doc.get("title", "Untitled Complaint"),
            
            "user": str(doc.get("submitted_by", "unknown")),
            # Some metadata
            "category": doc.get("category", "General"),
            "priority": doc.get("priority", "Low"),
            "status": doc.get("status", "Open"),
            "assigned_to": str(doc.get("assigned_to", "Unassigned"))
        }
    )

    qdrant.upsert(collection_name=COLLECTION_NAME, points=[point])
    count += 1
    print(f"{count}: Indexed → {doc.get('title', 'Untitled')} (point_id: {point_id[:8]}...)")

print(f"\nBackfill complete! {count} complaints indexed.")