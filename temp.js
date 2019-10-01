const sudo = require("sudo-prompt")
const cp = require("child_process")
cp.exec(`echo dir | (powershell.exe Start-Process -FilePath "explorer" -Verb runAs)`,(x)=>{console.log(x)})
// cp.exec("explorer.exe d:")