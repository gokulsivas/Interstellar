from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from space_cargo_management.routers import import_export, placement, search_retrieve, waste, time_simulation, logs

app = FastAPI(
    title="Cargo Management API",
    description="API for managing cargo placement, retrieval, waste, and time simulation.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(import_export.router)
app.include_router(logs.router)
app.include_router(placement.router)
app.include_router(search_retrieve.router)
app.include_router(waste.router)
app.include_router(time_simulation.router)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Cargo Management API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)