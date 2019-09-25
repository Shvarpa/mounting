let str = `Partition ###  Type              Size     Offset
-------------  ----------------  -------  -------
Partition 1    Primary           1863 GB  1024 KB`

let res = str.split("\n").map((line)=>line.split(/[ ][ ]+/))

console.log(res);
