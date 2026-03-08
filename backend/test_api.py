import asyncio
from app.api.incident_routes import analyze_incident_report
from fastapi import UploadFile
import io

# We need to test the analyze_incident_report function
async def main():
    try:
        # Load mock incident
        with open("mock_incident.pdf", "rb") as f:
            content = f.read()
            
        file = UploadFile(filename="mock_incident.pdf", file=io.BytesIO(content))
        
        # Call API
        result = await analyze_incident_report(file)
        print("RESULT:")
        print(result)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
