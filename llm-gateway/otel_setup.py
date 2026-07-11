"""OpenTelemetry setup — export traces to SigNoz (OTLP gRPC)."""
from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def setup_otel(app=None) -> bool:
    enabled = os.getenv("OTEL_ENABLED", "true").lower() in ("1", "true", "yes")
    if not enabled:
        logger.info("OpenTelemetry disabled")
        return False

    endpoint = (
        os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
        or "http://127.0.0.1:4317"
    )
    service_name = os.getenv("OTEL_SERVICE_NAME", "llama-server")

    os.environ["OTEL_SERVICE_NAME"] = service_name
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = endpoint
    os.environ.setdefault("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
    except ImportError:
        logger.warning("OpenTelemetry packages missing — skipping")
        return False

    resource = Resource.create(
        {
            "service.name": service_name,
            "service.version": os.getenv("SERVICE_VERSION", "0.1.0"),
            "deployment.environment": os.getenv("DEPLOY_ENV", "tailscale"),
        }
    )
    provider = TracerProvider(resource=resource)
    exporter = OTLPSpanExporter(endpoint=endpoint, insecure=True)
    provider.add_span_processor(
        BatchSpanProcessor(exporter, schedule_delay_millis=1000, max_export_batch_size=32)
    )
    trace.set_tracer_provider(provider)

    HTTPXClientInstrumentor().instrument()
    if app is not None:
        FastAPIInstrumentor.instrument_app(app)

    logger.info("OpenTelemetry enabled → %s (service=%s)", endpoint, service_name)
    return True


def get_tracer(name: str = "llama-gateway"):
    try:
        from opentelemetry import trace

        return trace.get_tracer(name)
    except Exception:
        from contextlib import nullcontext

        class _Noop:
            def start_as_current_span(self, *_a, **_k):
                return nullcontext()

        return _Noop()
