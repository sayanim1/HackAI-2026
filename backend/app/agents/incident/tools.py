import fitz  # PyMuPDF # type: ignore # pyre-ignore
import os
import chromadb      # type: ignore # pyre-ignore
from google import genai
import logging

logger = logging.getLogger(__name__)

# Initialize ChromaDB client (local persistent)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Initialize Gemini Client for embeddings (we'll use text-embedding-004)
def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = "MOCK_KEY"
    return genai.Client(api_key=api_key)

def parse_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file using PyMuPDF.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        return "Error extracting text from PDF."

def init_historical_incidents():
    """
    Loads mock historical incidents into ChromaDB if not already present.
    Uses Gemini API for embeddings.
    """
    try:
        collection = chroma_client.get_or_create_collection(name="historical_incidents")
        if collection.count() > 0:
            return # Already initialized
            
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("No Gemini API key, using mock embeddings for Chroma initialization.")
            # Chroma requires vectors, we'll just add some mock vectors if no key
            collection.add(
                documents=["SSO gateway timeout caused auth failure.", "Database connection pool exhausted."],
                metadatas=[{"type": "Auth"}, {"type": "DB"}],
                ids=["incident_1", "incident_2"],
                embeddings=[[0.1] * 768, [0.2] * 768] # mock 768d vectors
            )
            return

        client = _get_gemini_client()
        
        # Load from mock_incident.pdf
        pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "mock_incident.pdf")
        with open(pdf_path, "rb") as f:
            pdf_text = parse_pdf(f.read())
            
        # Basic chunking by "INCIDENT:"
        incidents_raw = pdf_text.split("INCIDENT:")
        docs = []
        metadatas = []
        ids = []
        
        for i, snippet in enumerate(incidents_raw):
            snippet = snippet.strip()
            if not snippet:
                continue
            
            # The actual title is the first line
            lines = snippet.split("\n")
            title = lines[0].strip() if lines else "Unknown Incident"
            full_text = "INCIDENT: " + snippet
            
            docs.append(full_text)
            metadatas.append({"cause": title})
            ids.append(f"hist_real_{i}")
        
        embeddings = []
        for doc in docs:
            result = client.models.embed_content(
                model='text-embedding-004',
                contents=doc,
            )
            embeddings.append(result.embeddings[0].values)
            
        collection.add(
            documents=docs,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings
        )
            
    except Exception as e:
        logger.error(f"Error initializing ChromaDB: {e}")

from typing import Any

def retrieve_similar_incidents(query: str, n_results: int = 3) -> list[dict[str, Any]]:
    """
    Retrieves top 3 similar past incidents from Chroma using Gemini embeddings
    along with their similarity scores.
    """
    try:
        collection = chroma_client.get_collection(name="historical_incidents")
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            results = collection.query(
                query_embeddings=[[0.1] * 768], # Mock query
                n_results=n_results
            )
            distances = results.get("distances", [[1.0]])[0]
            docs = results.get("documents", [[]])[0]
            # Return combined docs + distances so graph can detect "no match"
            return [{"doc": d, "distance": dist} for d, dist in zip(docs, distances)]

        client = _get_gemini_client()
        result = client.models.embed_content(
            model='text-embedding-004',
            contents=query,
        )
        query_embedding = result.embeddings[0].values
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        distances = results.get("distances", [[1.0]])[0]
        docs = results.get("documents", [[]])[0]
        return [{"doc": d, "distance": dist} for d, dist in zip(docs, distances)]
        
    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        return []
