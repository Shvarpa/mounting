import React from 'react'
import { render } from 'react-dom'
import os from "os"

let App;
try {
    App = require(`./${os.platform()}/components/App`)
}catch{
    App = require("./unsupported")
}


// import App from './components/App'

// Now we can render our application into it
render(<App />, document.getElementById('root'))
