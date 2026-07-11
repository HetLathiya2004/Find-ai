"""One-shot: send a test span to SigNoz OTLP to verify the pipeline."""
from __future__ import annotations

import os
import time

os.environ.setdefault("OTEL_EXPORTER_OTLP_ENDPOINT", "http://127.0.0.1:4317")
os.environ.setdefault("OTEL_SERVICE_NAME", "scrapping-service")

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

resource = Resource.create({"service.name": "scrapping-service"})
provider = TracerProvider(resource=resource)
exporter = OTLPSpanExporter(
    endpoint=os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"],
    insecure=True,
)
provider.add_span_processor(SimpleSpanProcessor(exporter))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("signoz-smoke")

with tracer.start_as_current_span("signoz.smoke_test") as span:
    span.set_attribute("smoke", True)
    span.set_attribute("http.method", "GET")
    span.set_attribute("http.route", "/health")
    time.sleep(0.05)

# force flush
provider.force_flush(timeout_millis=10000)
print("OK: smoke span exported to", os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"])
