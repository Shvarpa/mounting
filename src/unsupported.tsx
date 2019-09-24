import os from "os"
import "./assets/css/unsupported.scss"
import React from "react";

export default module.exports = ()=>{
    const platforms = {
        "darwin": "Mac OS",
        "win32": "Windows",
        "linux": "Linux"
    }
    const platform = platforms[os.platform()]!==undefined ? platforms[os.platform()] : os.platform();
    return (
        <h1 className="title section">{`Not supported on ${platform} yet`}</h1>
    );
}

