const deno = Deno; // mitigate vscode warnings


let url=deno.args[0];
let sent=0;
let errored=0;
let completed=0;
let lasterror=null;


let pros:Promise<any>[]=[];
let limit=parseInt(deno.args[1]||"10000");
let ifall=parseInt(deno.args[2]||"0");
let looping=true;


function update(){
    console.clear();
    console.log(`Sent: ${sent},\nCompleted: ${completed},\nErrored: ${errored}\n\n${lasterror||""}\n\n`);
}


while(true){
    pros[pros.length]=fetch(url).then(e=>{completed++;if(!looping)update();}).catch(e=>{errored++;lasterror=e;if(!looping)update();});
    sent++;
    update();
    //if(sent>249)await Promise.all(pros);
    await new Promise(r=>setTimeout(r,ifall));
    if(sent>limit){
        looping=false;
        break;
    };
}

await Promise.all(pros);
update();

export{}