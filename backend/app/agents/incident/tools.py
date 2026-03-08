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
        if not api_key or api_key == "your_gemini_api_key_here":
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
        docs = [
            "We had a major Auth Outage last month where the SSO Gateway timed out and caused 504 errors.",
            "The User DB connection pool was exhausted, preventing logins.",
            "Upstream Identity Provider Failure caused intermittent login issues."
        ]
        
        embeddings = []
        for doc in docs:
            result = client.models.embed_content(
                model='text-embedding-004',
                contents=doc,
            )
            embeddings.append(result.embeddings[0].values)
            
        collection.add(
            documents=docs,
            metadatas=[{"cause": "SSO Gateway"}, {"cause": "DB Auth"}, {"cause": "Upstream IdP"}],
            ids=["hist_1", "hist_2", "hist_3"],
            embeddings=embeddings
        )
            
    except Exception as e:
        logger.error(f"Error initializing ChromaDB: {e}")

def retrieve_similar_incidents(query: str, n_results: int = 2) -> list[str]:
    """
    Retrieves similar past incidents from Chroma using Gemini embeddings.
    """
    try:
        collection = chroma_client.get_collection(name="historical_incidents")
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            results = collection.query(
                query_embeddings=[[0.1] * 768], # Mock query
                n_results=n_results
            )
            return results.get("documents", [[]])[0]

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
        return results.get("documents", [[]])[0]
        
    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        return []
