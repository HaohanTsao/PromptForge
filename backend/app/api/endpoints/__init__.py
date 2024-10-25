from fastapi import APIRouter, HTTPException
from app.schemas import OptimizePromptRequest, TestPromptRequest, CreateLMRequest
from app.services.dspy_service import optimize_prompt, test_prompt, create_lm
from typing import Optional
import dspy
import asyncio

class LMManager:
    _instance = None
    _lock = asyncio.Lock()
    
    def __init__(self):
        self.lm = None
        
    @classmethod
    async def get_instance(cls):
        if not cls._instance:
            async with cls._lock:
                if not cls._instance:
                    cls._instance = cls()
        return cls._instance
    
    async def set_lm(self, provider: str, lm_args: dict):
        async with self._lock:
            self.lm = create_lm(provider=provider, lm_args=lm_args)
            dspy.settings.configure(lm=self.lm)
            
    def get_lm(self) -> Optional[object]:
        return self.lm

router = APIRouter()

@router.post("/create_lm")
async def create_lm_endpoint(request: CreateLMRequest):
    try:
        lm_manager = await LMManager.get_instance()
        await lm_manager.set_lm(provider=request.provider, lm_args=request.lm_args)
        return {"message": "LM created and configured successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize_prompt")
async def optimize_prompt_endpoint(request: OptimizePromptRequest):
    try:
        lm_manager = await LMManager.get_instance()
        if not lm_manager.get_lm():
            raise HTTPException(
                status_code=400, 
                detail="LM not initialized. Please call create_lm first."
            )
        
        optimized_module = optimize_prompt(
            request.system_prompt, 
            request.training_data, 
            request.module_name
        )
        return {"optimized_module": optimized_module}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test_prompt")
async def test_prompt_endpoint(request: TestPromptRequest):
    try:
        lm_manager = await LMManager.get_instance()
        if not lm_manager.get_lm():
            raise HTTPException(
                status_code=400, 
                detail="LM not initialized. Please call create_lm first."
            )
            
        output = test_prompt(request.compiled_module_name, request.test_input)
        return {"output": output}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))