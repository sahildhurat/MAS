import asyncio
import websockets

async def test():
    async with websockets.connect('ws://127.0.0.1:8000/ws/v1/voice/test_session') as ws:
        await ws.send('{"question": "Plan a 3-day luxury trip to Dubai"}')
        res = await ws.recv()
        print(res)

asyncio.run(test())
