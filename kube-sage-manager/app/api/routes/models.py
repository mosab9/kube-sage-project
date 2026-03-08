from fastapi import APIRouter, HTTPException

from app.core.llm_engine import list_models
from app.models.schemas import ModelsResponse, OllamaModel

router = APIRouter()


@router.get("/models", response_model=ModelsResponse)
async def get_models():
    """List available Ollama models."""
    try:
        models_data = await list_models()
        models = [
            OllamaModel(
                name=m.get("name", ""),
                size=m.get("size"),
                modified_at=m.get("modified_at"),
                digest=m.get("digest"),
            )
            for m in models_data
        ]
        return ModelsResponse(models=models)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch models: {str(e)}")
