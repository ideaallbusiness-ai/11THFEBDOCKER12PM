from fastapi import FastAPI, Request, Response
from starlette.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()
NEXTJS_URL = "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_to_nextjs(request: Request, path: str):
    try:
        target_url = f"{NEXTJS_URL}/api/{path}"
        if request.query_params:
            target_url += f"?{request.query_params}"
        
        body = await request.body()
        headers = {k: v for k, v in request.headers.items() if k.lower() not in ['host', 'content-length']}
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get('content-type', 'application/json')
            )
    except Exception as e:
        return Response(content=f'{{"error": "{str(e)}"}}', status_code=502, media_type="application/json")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
