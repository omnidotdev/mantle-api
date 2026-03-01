import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import appConfig from "lib/config/app.config";

const resource = resourceFromAttributes({
	[ATTR_SERVICE_NAME]: appConfig.name,
});

const sdk = new NodeSDK({
	resource,
	traceExporter: new OTLPTraceExporter(),
	logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter()),
	instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
