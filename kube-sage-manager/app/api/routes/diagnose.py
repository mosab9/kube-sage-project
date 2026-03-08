from fastapi import APIRouter

from app.core.context_builder import build_context
from app.core.llm_engine import diagnose
from app.core.metrics_store import metrics_store
from app.models.schemas import DiagnoseRequest, DiagnoseResponse, Diagnosis, ModelMetrics

router = APIRouter()


@router.post("/diagnose", response_model=DiagnoseResponse)
async def run_diagnosis(req: DiagnoseRequest):
    context = await build_context(
        namespace=req.namespace, pod=req.pod, timeframe=req.timeframe
    )
    result = await diagnose(context, model=req.model)
    raw = result.diagnosis

    diagnosis = Diagnosis(
        root_cause=raw.get("root_cause", "Unknown"),
        explanation=raw.get("explanation", ""),
        severity=raw.get("severity", "unknown"),
        evidence=raw.get("evidence", []),
        remediation_steps=[],
    )
    for step in raw.get("remediation_steps", []):
        if isinstance(step, dict):
            diagnosis.remediation_steps.append(
                {"description": step.get("description", ""), "command": step.get("command"), "executable": step.get("executable", False)}
            )

    metrics = ModelMetrics(
        model=result.model,
        latency_ms=result.latency_ms,
        tokens_generated=result.eval_count,
        tokens_per_second=result.tokens_per_second,
        prompt_eval_count=result.prompt_eval_count,
        eval_count=result.eval_count,
        total_duration_ns=result.total_duration_ns,
        load_duration_ns=result.load_duration_ns,
        prompt_eval_duration_ns=result.prompt_eval_duration_ns,
        eval_duration_ns=result.eval_duration_ns,
    )

    metrics_store.add(
        namespace=req.namespace,
        pod=req.pod,
        model=result.model,
        latency_ms=result.latency_ms,
        tokens_generated=result.eval_count,
        tokens_per_second=result.tokens_per_second,
        root_cause=diagnosis.root_cause,
        explanation=diagnosis.explanation,
        severity=diagnosis.severity,
        evidence=diagnosis.evidence,
        remediation_steps=diagnosis.remediation_steps,
    )

    return DiagnoseResponse(
        pod=req.pod, namespace=req.namespace, diagnosis=diagnosis, metrics=metrics
    )
