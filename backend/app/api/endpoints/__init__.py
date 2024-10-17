from fastapi import APIRouter, HTTPException
from app.schemas import OptimizePromptRequest, TestPromptRequest
from app.services.dspy_service import optimize_prompt, test_prompt

router = APIRouter()

@router.post("/optimize_prompt")
async def optimize_prompt_endpoint(request: OptimizePromptRequest):
    try:
        optimized_prompt = optimize_prompt(request.system_prompt, request.training_data, request.module_name)
        return {"optimized_module": optimized_prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test_prompt")
async def test_prompt_endpoint(request: TestPromptRequest):
    try:
        output = test_prompt(request.compiled_module_name, request.test_input)
        return {"output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))