import { Renderer, View, Text, Window, Image, Button, } from "@nodegui/react-nodegui";
import { QPushButtonEvents, QMainWindowEvents, QWidgetEvents, QKeyEvent, NativeEvent } from "@nodegui/nodegui";
import path from "path";
import React, { useState } from "react";
import { AspectRatioMode } from "@nodegui/nodegui";

import cmd = require("child_process");

import imageUrl from "./assets/nodegui.jpg";
const distImgUrl = path.resolve(__dirname, imageUrl);
const minSize = {width: 550, height: 400};

const App = () => {
  const [disks, setDisks] = useState({})
  const [temp, setTemp] = useState("temp")
  const ls_command = ()=>{ cmd.exec("ls -l",(error,stdout,stderr)=>{setTemp(stdout)}) }
  return (
    <Window minSize={minSize} styleSheet={styleSheet}>
      <View id="container">
        <Text style="font-size: 15px; font-weight: bold; margin-bottom: 20px;">Hello World</Text>
        <Image
          style={imageStyle}
          src={distImgUrl}
          aspectRatioMode={AspectRatioMode.KeepAspectRatio}
        />
        <Text>{temp}</Text>
        <Button on={{[QPushButtonEvents.clicked]:ls_command}} text={"ls -l"}></Button>
      </View>
    </Window>
  );
};

const imageStyle = `
  height: "100px";
  width: "100px";
  qproperty-alignment: 'AlignHCenter';
`;

const styleSheet = `
  #container {
    flex: 1;
    flex-direction: column;
    min-height: '100%';
    align-items: 'center';
    justify-content: 'center';
  }
`;

Renderer.render(<App />);
