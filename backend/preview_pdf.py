import fitz
import sys

def main():
    try:
        doc = fitz.open("c:/Users/tanvi/OneDrive/Desktop/HackAI-2026/backend/mock_incident.pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        print("--- START OF PDF ---")
        print(text[:2000]) # First 2000 chars should be enough to see structure
        print("--- END OF PDF ---")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
