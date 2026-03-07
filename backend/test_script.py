import requests
import time
from fpdf import FPDF
import os

def create_mock_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Incident Report: DB Auth Outage", ln=True, align='C')
    pdf.cell(200, 10, txt="Timeline: 12:00 PM - 12:45 PM", ln=True)
    pdf.cell(200, 10, txt="Symptoms: Users receiving 500 errors when attempting to log in.", ln=True)
    pdf.cell(200, 10, txt="Affected Systems: User DB, SSO Gateway", ln=True)
    pdf.output("mock_incident.pdf")

def test_market():
    print("Testing Market Intelligence API...")
    try:
        response = requests.post("http://localhost:8000/api/market/chat", json={"message": "What is the outlook for AAPL?"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Market Test Error: {e}")

def test_incident():
    print("Testing Incident Analyst API...")
    try:
        create_mock_pdf()
        with open("mock_incident.pdf", "rb") as f:
            files = {"file": ("mock_incident.pdf", f, "application/pdf")}
            response = requests.post("http://localhost:8000/api/incident/analyze", files=files)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Incident Test Error: {e}")

def test_health():
    print("Testing Health Check API...")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health Test Error: {e}")

if __name__ == "__main__":
    test_health()
    print("-" * 40)
    test_market()
    print("-" * 40)
    test_incident()
