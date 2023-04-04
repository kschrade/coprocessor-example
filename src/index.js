const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// first hook in the process request
function handleRouterRequest(req, res) {
  const request = req.body;
  const operationName = request.body.operationName;
  if (request.body.operationName) {
    request.context.entries.operationName = request.body.operationName;
  }

  if (operationName === 'IntrospectionQuery') {
    res.json(request);
    return;
  }

  res.json(request);
}

// similar to will send response hook
function handleRouterResponse(req, res) {
  const request = req.body;
  const operationName = request.context.entries.operationName;

  if (operationName === 'IntrospectionQuery') {
    res.json(request);
    return;
  }

  const { errors } = request.body;
  if (errors) {
    // do all your error formatting here for a subgraph return
    const groomedErrors = errors.map((e) => {
      const { extensions } = e;
      return {
        message: e.message ?? 'An unhandled error has occurred',
        extensions: {
          ...extensions,
          locations: [{ line: 6, column: 7 }],
          errorType: extensions.errorType ?? 'UNKNOWN_ERROR',
          errorCode: extensions.errorCode ?? 500,
          serviceName: request.serviceName,
          timestamp: extensions.timestamp ?? new Date().toISOString(),
        },
      };
    });
    request.body.errors = groomedErrors;
  }

  //   console.log('✉️  Got payload: ', request);
  res.json(request);
}

function handleSubgraphResponse(req, res) {
  const request = req.body;
  const operationName = request.context.entries.operationName;

  if (operationName === 'IntrospectionQuery') {
    res.json(request);
    return;
  }

  const { errors } = request.body;
  if (errors) {
    // do all your error formatting here for a subgraph return
    const groomedErrors = errors.map((e) => {
      const { extensions } = e;
      return {
        message: e.message ?? 'An unhandled error has occurred',
        extensions: {
          ...extensions,
          locations: [{ line: 6, column: 7 }],
          errorType: extensions.errorType ?? 'UNKNOWN_ERROR',
          errorCode: extensions.errorCode ?? 500,
          serviceName: request.serviceName,
          timestamp: extensions.timestamp ?? new Date().toISOString(),
        },
      };
    });
    request.body.errors = groomedErrors;
  }

  res.json(request);
}

app.post('/', (req, res) => {
  console.log(`received a request with a stage of ${req.body.stage}`);
  switch (req.body.stage) {
    case 'RouterResponse': {
      handleRouterResponse(req, res);
      return;
    }
    case 'RouterRequest': {
      handleRouterRequest(req, res);
      return;
    }
    case 'SubgraphResponse': {
      handleSubgraphResponse(req, res);
      return;
    }
    default: {
      res.json(req.body);
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 Coprocessor running on port ${port}`);
  console.log(
    `Run a router with the provided router.yaml configuration to test the example:`
  );
  console.log(
    `APOLLO_KEY="YOUR_APOLLO_KEY" APOLLO_GRAPH_REF="YOUR_APOLLO_GRAPH_REF" cargo run -- --configuration router.yaml`
  );
});
