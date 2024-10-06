'use strict';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources';


// Not functionally required but gives some insight what happens behind the scenes
// const  = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider, ConsoleSpanExporter, Span, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');


import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
import { ATTR_SERVICE_NAME, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions'
import { Request,Response } from 'express';

console.log('starting trace');
const exporter = new JaegerExporter()
const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: 'dev'
  })
});
provider.register({
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
registerInstrumentations({
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new ExpressInstrumentation(),
    new HttpInstrumentation({
      requestHook: (span: Span, request: Request) => {
        span.setAttribute("correlationid", request.headers['x-correlation-id']);
      },
      responseHook: (span: Span, response: Response) => {
        const traceID = span.spanContext().traceId;
        response.setHeader("x-trace-id", traceID);
        return response;
      }
    }),
    new MongoDBInstrumentation({
      enhancedDatabaseReporting: true
    })
  ],
});

