# HTTP-debug
Debugs http connection.

## Options
- `HOSTNAME`: The host it will connect to.
- `--port=PORT`: The port it will use.
- `-t | --tls`: Makes the connection use tls.
- `--method=METHOD`: Method it uses for the request.
- `--header="HEADER-NAME: HEADER VALUE"`: Adds custom header. Can be used multiple times.
- `--data="DATA" | --payload="PAYLOAD"`: Add custom text to the req body. Can be used multiple times.

## Examples
```bash
# These two do the same thing
deno run --allow-all main.ts -t --port=443 --data="Hello, world!" --method="POST" --path=hello example.com
deno run --allow-all main.ts -data="Hello, world!" --method="POST" https://example.com/hello
```