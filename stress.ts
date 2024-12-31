const deno = Deno; // mitigate vscode warnings

let url=deno.args[0];
let sent=0;
let errored=0;
let completed=0;
let lasterror=null;

let pros:Promise<any>[]=[];

while(true){
    pros[pros.length]=fetch(url).then(e=>sent++).catch(e=>{errored++;lasterror=e});
    sent++;
    console.clear();
    console.log(`Sent: ${sent},\nCompleted: ${completed},\nErrored: ${errored}\n\n${lasterror||""}\n\n`);
    if(sent>99)await Promise.all(pros);
}

export{}