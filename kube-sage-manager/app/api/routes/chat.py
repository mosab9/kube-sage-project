import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.llm_engine import chat_stream

router = APIRouter()

SYSTEM_MESSAGE = {
    "role": "system",
    "content": (
        "You are KubeSage, an AI assistant for Kubernetes troubleshooting and optimization. "
        "Help users diagnose issues, understand cluster state, and suggest remediation steps."
    ),
}


@router.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    await ws.accept()
    messages: list[dict] = [SYSTEM_MESSAGE]
    current_model: str | None = None

    try:
        while True:
            data = await ws.receive_text()
            payload = json.loads(data)

            # Handle model selection message
            if payload.get("type") == "set_model":
                current_model = payload.get("model")
                await ws.send_text(json.dumps({"type": "model_set", "model": current_model}))
                continue

            user_msg = payload.get("content", data)
            # Allow per-message model override
            msg_model = payload.get("model", current_model)
            messages.append({"role": "user", "content": user_msg})

            full_response = ""
            metrics_data = None

            async for result in chat_stream(messages, model=msg_model):
                if result.token:
                    await ws.send_text(json.dumps({"type": "token", "content": result.token}))
                    full_response += result.token

                if result.done:
                    metrics_data = {
                        "model": result.model,
                        "eval_count": result.eval_count,
                        "total_duration_ns": result.total_duration_ns,
                        "prompt_eval_duration_ns": result.prompt_eval_duration_ns,
                        "eval_duration_ns": result.eval_duration_ns,
                    }
                    if result.eval_count and result.eval_duration_ns:
                        metrics_data["tokens_per_second"] = result.eval_count / (result.eval_duration_ns / 1e9)

            messages.append({"role": "assistant", "content": full_response})
            await ws.send_text(json.dumps({"type": "done", "metrics": metrics_data}))
    except WebSocketDisconnect:
        pass
