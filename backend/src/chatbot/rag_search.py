from config import model, qdrant, docs, COLLECTION_NAME, GEMINI_API_KEY, GEMINI_MODEL
import requests
from bson import ObjectId
from qdrant_client import  models
def search_qdrant(query: str, user: str = None, top_k: int = 5):
    query_vec = model.encode(query).tolist()

    filter_condition = None
    if user:
        filter_condition = models.Filter(
            must=[
                models.FieldCondition(
                    key="user",
                    match=models.MatchValue(value=str(user))
                )
            ]
        )

    hits = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vec,
        query_filter=filter_condition,
        limit=top_k,
        score_threshold=0.2
    ).points

    contexts = []
    for hit in hits:
        # 1. Fetch the full document from MongoDB using the ID stored in Qdrant
        if hit.payload and "doc_id" in hit.payload:
            doc_id = hit.payload["doc_id"]
            doc = docs.find_one({"_id": ObjectId(doc_id)})
            
            if doc:
                # 2. Extract specific Complaint fields (Updated for your DB structure)
                title = doc.get("title", "Untitled Complaint")
                desc = doc.get("description", "No description")
                status = doc.get("status", "Unknown")
                category = doc.get("category", "General")
                priority = doc.get("priority", "N/A")
                remarks = doc.get("remarks", "")

                # 3. Format the text so Gemini understands the context
                formatted_text = (
                    f"Title: {title}\n"
                    f"Category: {category} | Priority: {priority} | Status: {status}\n"
                    f"Description: {desc}\n"
                    f"Remarks: {remarks}"
                )

                contexts.append({
                    "content": formatted_text,
                    "filename": title,  # Using Title as the "filename" for citation
                    "score": hit.score
                })
    return contexts