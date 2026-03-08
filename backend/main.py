import uvicorn
from app.main import app

def main():
    import sys
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

if __name__ == "__main__":
    main()
