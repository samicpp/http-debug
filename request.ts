const deno = Deno; // mitigate vscode warnings

let args: {
  opt: Record<string, string[]>;
  sopt: string;
  lopt: string[];
} = {
  opt: {},
  sopt: "",
  lopt: [],
};
let nopt: string = "";
for (let a of deno.args) {
  if (nopt) {
    args.opt[nopt.replace("--", "")] = a;
    nopt = "";
  } else if (a.startsWith("--") && a.length > 2) {
    let l = a.split("=");
    let fl = l[0].replace("--", "");
    if (!args.opt[fl]) args.opt[fl] = [String(l[1])];
    else args.opt[fl].push(String(l[1]));
    //nopt=a
  } else if (a.startsWith("-") && a.length > 1) args.sopt += a.replace("-", "");
  else args.lopt.push(a);
}

const tc = {
  e: TextEncoder.prototype.encode.bind(new TextEncoder()),
  d: TextDecoder.prototype.decode.bind(new TextDecoder()),
};

let tls = args.sopt.includes("t") || args.opt?.tls;
let port = parseInt(args.opt?.port?.[0]);
let host = args.lopt[0];
let path = args.opt?.path?.[0];
let url: URL;
let simple = args.sopt.includes("s");
let isWs = args.sopt.includes("W");

try {
  url = new URL(host);
} catch (err) {
  url = new URL(
    `${tls ? "https" : "http"}://${host || "localhost"}${
      port ? ":" + port : ""
    }/${path || ""}`,
  );
}

const opt = {
  port: parseInt(url.port || (url.protocol == "https:" ? "443" : "80")),
  path: url.pathname + url.search,
  host: url.hostname,
  tls: url.protocol == "https:",
};
if (!simple) console.log("Input = ", url.href);
let ns = {
  ipAddr: "",
  port: 0,
};
if (args.opt.ns) {
  let ipp = args.opt.ns[0].split(":");
  ns.ipAddr = ipp[0];
  ns.port = parseInt(ipp[1] || "53");
}
const [ip] = await deno.resolveDns(opt.host, "A", args.opt.ns ? ns : null);
if (!simple) console.log("Resolved " + opt.host + ":", ip);

if (opt.tls) {
  if(!simple)console.log("Trying tls connection to "+opt.host+" on port "+opt.port);
  const tls = await deno.connectTls({ hostname: opt.host, port: opt.port });
  if (!isWs) main(tls);
  else ws(tls);
} else {
  if(!simple)console.log("Trying tcp connection to "+opt.host+" on port "+opt.port);
  const tcp = await deno.connect({ hostname: ip, port: opt.port });
  if (!isWs) main(tcp);
  else ws(tcp);
}

async function main(conn) {
  const method = args.opt.method?.[0] || "GET";
  const payload = args.opt.data?.join("\n") || args.opt.payload?.join("\n");
  const headers = args.opt.header?.join("\r\n");
  const req = `${method} ${opt.path} HTTP/1.1\r
Host: ${opt.host}\r${payload ? `\nContent-Length: ${payload.length}\r` : ""}
Date: ${new Date()}\r${headers ? "\n" + headers + "\r" : ""}
\r
${payload}`;
  await conn.write(tc.e(req));
  if (!simple) console.log("Wrote\n\n" + req + "\n");
  if (simple) console.log("\x1b[32m" + req + "\x1b[0m\n");
  const buf = new Uint8Array(32 * 1024 ** 2); //32mb
  const len = await conn.read(buf);
  const buff = buf.subarray(0, len);
  const str = tc.d(buff);

  if (!simple) console.log("Received response", len, buff.length);

  if (!simple) console.log("Content\n\n" + str + "\n");
  if (simple) console.log("\x1b[31m" + str + "\x1b[0m\n");
}
async function ws(conn) {
  let p = Math.floor(Math.random() * 10000 + 50000);
  const w = deno.listen({ port: p, address: "127.0.0.1" });
  if(!simple)console.log("Attempting WebSocket connection");
  const ws=new WebSocket(`ws://localhost:${p}/${opt.path}`);
  const pc = await w.accept();
  if(!simple)console.log("Connection established")
  handler(conn, pc, "\x1b[31m");
  handler(pc, conn, "\x1b[32m");
  let msg=0;

  for await (const chunk of deno.stdin.readable) ws.send(tc.d(chunk));

  async function handler(sc, dc, color = "\x1b[0m") {
    const buf = new Uint8Array(4096);
    while (true) {
      try {
        const len = await sc.read(buf);
        if (len === null) {
          console.log("\x1b[33mclose\x1b[0m\n");
          break;
        }
        msg++;
        const buff = buf.subarray(0, len);

        console.log(`${color}${tc.d(buff)}\x1b[0m`);
        if(msg>=2){
            let str='';
            for(let i of buff)str+=`0x${i.toString(16)} `;
            console.log(`${color}${str}\x1b[0m`);
        };

        await dc.write(buff);
      } catch (err) {
        console.log(`\x1b[33m${err.stack}\x1b[0m\n`);
        break;
      }
    }
  }
}

export {}; // mitigate vscode warnings
