import fs = require("fs")
import cmd = require('child_process');

cmd.exec("diskutil list", (_,stdout,_stderr)=>{
    console.log(stdout);
})