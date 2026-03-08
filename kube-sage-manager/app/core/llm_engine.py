import json
import logging
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class DiagnoseResult:
    diagnosis: dict
    model: str
    latency_ms: float
    prompt_eval_count: int | None = None
    eval_count: int | None = None
    total_duration_ns: int | None = None
    load_duration_ns: int | None = None
    prompt_eval_duration_ns: int | None = None
    eval_duration_ns: int | None = None

    @property
    def tokens_per_second(self) -> float | None:
        if self.eval_count and self.eval_duration_ns:
            return self.eval_count / (self.eval_duration_ns / 1e9)
        return None


@dataclass
class ChatStreamResult:
    token: str
    done: bool = False
    model: str | None = None
    eval_count: int | None = None
    total_duration_ns: int | None = None
    prompt_eval_duration_ns: int | None = None
    eval_duration_ns: int | None = None


async def list_models() -> list[dict]:
    """List available Ollama models."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{settings.ollama_url}/api/tags")
        resp.raise_for_status()
        data = resp.json()
        return data.get("models", [])

SYSTEM_PROMPT = """You are KubeSage, an expert Kubernetes troubleshooting assistant.
Analyze the provided cluster context and produce a diagnosis.

Respond ONLY with valid JSON in this format:
{
  "root_cause": "brief root cause",
  "explanation": "detailed explanation",
  "severity": "critical|high|medium|low",
  "evidence": ["evidence item 1", "evidence item 2"],
  "remediation_steps": [
    {"description": "step description", "command": "kubectl ...", "executable": false}
  ]
}"""


async def diagnose(context: str, model: str | None = None) -> DiagnoseResult:
    selected_model = model or settings.ollama_model
    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Diagnose the following Kubernetes issue:\n\n{context}"},
        ],
        "stream": False,
        "format": "json",
    }

    start_time = time.perf_counter()
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{settings.ollama_url}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
    latency_ms = (time.perf_counter() - start_time) * 1000

    content = data.get("message", {}).get("content", "{}")
    try:
        diagnosis = json.loads(content)
    except json.JSONDecodeError:
        logger.error("LLM returned non-JSON: %s", content[:200])
        diagnosis = {
            "root_cause": "Unable to parse LLM response",
            "explanation": content,
            "severity": "unknown",
            "evidence": [],
            "remediation_steps": [],
        }

    return DiagnoseResult(
        diagnosis=diagnosis,
        model=selected_model,
        latency_ms=latency_ms,
        prompt_eval_count=data.get("prompt_eval_count"),
        eval_count=data.get("eval_count"),
        total_duration_ns=data.get("total_duration"),
        load_duration_ns=data.get("load_duration"),
        prompt_eval_duration_ns=data.get("prompt_eval_duration"),
        eval_duration_ns=data.get("eval_duration"),
    )


async def chat_stream(
    messages: list[dict], model: str | None = None
) -> AsyncGenerator[ChatStreamResult, None]:
    selected_model = model or settings.ollama_model
    payload = {
        "model": selected_model,
        "messages": messages,
        "stream": True,
    }
    start_time = time.perf_counter()
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", f"{settings.ollama_url}/api/chat", json=payload) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    is_done = chunk.get("done", False)

                    if is_done:
                        latency_ms = (time.perf_counter() - start_time) * 1000
                        yield ChatStreamResult(
                            token=token,
                            done=True,
                            model=selected_model,
                            eval_count=chunk.get("eval_count"),
                            total_duration_ns=chunk.get("total_duration"),
                            prompt_eval_duration_ns=chunk.get("prompt_eval_duration"),
                            eval_duration_ns=chunk.get("eval_duration"),
                        )
                    elif token:
                        yield ChatStreamResult(token=token)
                except json.JSONDecodeError:
                    continue
