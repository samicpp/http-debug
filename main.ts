const deno=Deno;// mitigate vscode warnings

let args:{
    opt:Record<string,string[]>;
    sopt:string;
    lopt:string[];
}={
    opt:{},
    sopt:'',
    lopt:[],
};
let nopt:string='';
for(let a of deno.args){
    if(nopt){
        args.opt[nopt.replace("--","")]=a;
        nopt="";
    } else if(a.startsWith("--")&&a.length>2){
        let l=a.split("=");
        let fl=l[0].replace("--","");
        if(!args.opt[fl])args.opt[fl]=[String(l[1])];
        else args.opt[fl].push(String(l[1]));
        //nopt=a
    }
    else if(a.startsWith("-")&&a.length>1)args.sopt+=a.replace("-","");
    else{args.lopt.push(a)}
}

const tc={
    e:TextEncoder.prototype.encode.bind(new TextEncoder),
    d:TextDecoder.prototype.decode.bind(new TextDecoder),
};

let tls=args.sopt.includes("t")||args.opt?.tls;
let port=parseInt(args.opt?.port?.[0]);
let host=args.lopt[0];
let path=args.opt?.path?.[0];
let url:URL;

try{
    url=new URL(host);
}catch(err){
    url=new URL(`${tls?"https":"http"}://${host||"localhost"}${port?":"+port:""}/${path||""}`);
};

const opt={
    port: parseInt(url.port||(url.protocol=="https:"?'443':'80')),
    path: url.pathname+url.search,
    host: url.hostname,
    tls: url.protocol=="https:",
};
console.log("Input = ",url.href);
let ns={
    ipAddr:"",
    port:0,
};
if(args.opt.ns){
    let ipp=args.opt.ns[0].split(":");
    ns.ipAddr=ipp[0];
    ns.port=parseInt(ipp[1]||"53");
}
const [ip]=await deno.resolveDns(opt.host,"A",args.opt.ns?ns:null);
console.log("Resolved "+opt.host+":",ip);

if(opt.tls){
    const tls=await deno.connectTls({hostname:opt.host,port:opt.port});
    main(tls);
} else {
    const tcp=await deno.connect({hostname:ip,port:opt.port});
    main(tcp);
}

async function main(conn){
    const method=args.opt.method?.[0]||"GET";
    const payload=args.opt.data?.join('\n')||args.opt.payload?.join('\n');
    const headers=args.opt.header?.join("\r\n");
    const req=`${method} ${opt.path} HTTP/1.1\r
Host: ${opt.host}\r${payload?`\nContent-Length: ${payload.length}\r`:""}
Date: ${new Date}\r${headers?'\n'+headers+'\r':""}
\r
${payload}`;
    await conn.write(tc.e(req));
    console.log("Wrote\n\n"+req+'\n');
    const buf=new Uint8Array(32*1024**2); //32mb
    const len=await conn.read(buf);
    const buff=buf.subarray(0,len);
    const str=tc.d(buff);

    console.log("Received response",len,buff.length);
    
    console.log("Content\n\n"+str+'\n');
}


export{};