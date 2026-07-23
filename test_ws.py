import asyncio
import websockets
import json

async def test_ws():
    uri = "wss://mas-iiz2.onrender.com/ws/v1/voice/test1234"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket.")
            
            payload = {
                "question": "Hello, how are you?",
                "itinerary": None,
                "destination": ""
            }
            await websocket.send(json.dumps(payload))
            print(f"Sent: {payload}")
            
            # Wait for response with timeout
            response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
            print(f"Received: {response}")
            
    except asyncio.TimeoutError:
        print("Timeout waiting for response.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
