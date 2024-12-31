# HTTP-debug
Some tools for http debugging

## request.ts
Sends a HTTP request and displays the direct tcp messages. Can also do the same for WebSocket connections.

### Options
- `HOSTNAME`: The host it will connect to.
- `--port=PORT`: The port it will use.
- `-t | --tls`: Makes the connection use tls.
- `--method=METHOD`: Method it uses for the request.
- `--header="HEADER-NAME: HEADER VALUE"`: Adds custom header. Can be used multiple times.
- `--data="DATA" | --payload="PAYLOAD"`: Add custom text to the req body. Can be used multiple times.

### Examples
```bash
# These two do the same thing
deno run --allow-all main.ts -t --port=443 --data="Hello, world!" --method="POST" --path=hello example.com
deno run --allow-all main.ts -data="Hello, world!" --method="POST" https://example.com/hello
```

## stress.ts
Stress tests a host. Only use with permission

### Options
`FULL_URL AMOUNT COOLDOWN`

### Examples
```bash
# These two do the same thing
deno run --allow-all main.ts http://localhost/ 100000 0
deno run --allow-all main.ts http://localhost/ 1000 100
```
