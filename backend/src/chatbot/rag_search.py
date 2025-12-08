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
        if hit.payload and "doc_id" in hit.payload:
            doc_id = hit.payload["doc_id"]
            doc = docs.find_one({"_id": ObjectId(doc_id)})
            
            if doc:
                title = doc.get("title", "Untitled Complaint")
                desc = doc.get("description", "No description")
                status = doc.get("status", "Unknown")
                category = doc.get("category", "General")
                priority = doc.get("priority", "N/A")
                remarks = doc.get("remarks", "")

                formatted_text = (
                    f"Title: {title}\n"
                    f"Category: {category} | Priority: {priority} | Status: {status}\n"
                    f"Description: {desc}\n"
                    f"Remarks: {remarks}"
                )

                contexts.append({
                    "content": formatted_text,
                    "filename": title,  
                    "score": hit.score
                })
    return contexts

def call_gemini(prompt: str) -> str:
    
    clean_key = GEMINI_API_KEY.strip()
    clean_model = GEMINI_MODEL.strip()
    

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={clean_key}"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024
        }
    }

    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except requests.exceptions.HTTPError as e:
        return f"Gemini API Error: {e.response.status_code} - {e.response.text}"
    except Exception as e:
        return f"Error: {e}"
    
def answer_question(query: str, user: str = None) -> str:
    results = search_qdrant(query, user, top_k=5)

    if not results:
        return "I don't have any relevant information."

    context = "\n\n".join([
        f"[{i+1}] {r['filename']}\n{r['content']}"
        for i, r in enumerate(results)
    ])

    prompt = f"""Answer only from the documents below. If unsure, say "I don't know."

Documents:
{context}

Question: {query}
Answer:"""

    return call_gemini(prompt)