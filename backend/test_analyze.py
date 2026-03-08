import urllib.request
import json

url = "http://127.0.0.1:8000/api/incident/analyze_text"
data = {
    "text": "\"incident_id\": \"INC10451\" \"category\": \"Database\" \"priority\": \"Critical\" \"short_description\": \"Order processing service failing due to database connection errors\" \"description\": \"Since 14:10 UTC the order-service API has been returning 500 errors due to exhaustion of the PostgreSQL connection pool.\" \"affected_system\": \"Order Processing Service PostgreSQL Cluster\""
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
