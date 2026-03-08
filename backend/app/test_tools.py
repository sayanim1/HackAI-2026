from backend.app.agents.market.tools import get_stock_data
import os

def test_tools():
    # Test with a real ticker
    data = get_stock_data("AAPL")
    print(f"Type: {type(data)}")
    print(f"Data: {data}")
    
    # Test with a non-existent ticker
    data = get_stock_data("INVALID_TICKER")
    print(f"Type: {type(data)}")
    print(f"Data: {data}")

if __name__ == "__main__":
    test_tools()
