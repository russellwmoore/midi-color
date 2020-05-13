import { Midi } from "@tonejs/midi";
import { Player } from "tone";
import { Buffer } from "tone";
import { Draw } from "tone";
import { Transport } from "tone";

// create start button
const startButton = document.createElement("div");
startButton.style.display = "flex";
startButton.style.justifyContent = "center";
startButton.style.alignItems = "center";
startButton.style.width = "200px";
startButton.style.height = "100px";
startButton.style.background = "yellow";
startButton.style.fontFamily = "monospace";
startButton.style.fontSize = "2em";
startButton.innerText = "start";

startButton.addEventListener("click", start);
startButton.setAttribute("id", "start");
document.body.appendChild(startButton);

const innerGridStyle = `
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  box-sizing: border-box;
  border: 10px solid white;
`;

const containerGridStyle = `
  display: grid;
  height: 100vh;
  width: 100vw;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
`;

// create grid container
const containerGrid = document.createElement("div");
const gridOne = document.createElement("div");
const gridTwo = document.createElement("div");

containerGrid.style = containerGridStyle;
gridOne.style = innerGridStyle;
gridTwo.style = innerGridStyle;

// create Tone.Player
const player = new Player("./audio/bachAudio.mp3", {
  autoplay: false,
}).toMaster();
player.sync().start();

// on audio load, schedule drawing
Buffer.on("load", () => {
  draw();
});

//-----------------------------------------------------------------------
function shiftToBlue(val) {
  const shifted = parseFloat(val) + 240;
  if (shifted >= 360) {
    return shifted - 360;
  }
  return shifted;
}

//-----------------------------------------------------------------------
function scale(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

//-----------------------------------------------------------------------
// schedule drawing based on midi note times
async function draw() {
  // get midi data
  const keysOne = await Midi.fromUrl("./midi/bachKeys1.mid");
  const keysTwo = await Midi.fromUrl("./midi/bachKeys2.mid");

  // get notes from first track
  const keysOneNotes = keysOne.tracks[0].notes;
  const keysTwoNotes = keysTwo.tracks[0].notes;

  //loop through keysOneNotes
  keysOneNotes.forEach((note) => {
    console.log(note.midi);
    let time = note.time;
    let duration = note.duration;
    // schedule append element based on note.time
    Transport.schedule(function (time) {
      Draw.schedule(function () {
        const element = document.createElement("div");
        const column = 8 - Math.floor(scale(note.midi, 55, 72, 1, 7));
        element.style.gridArea = `${column} / 1/ ${column} / 8`;
        element.style.zIndex = 5;

        const hue = scale(note.midi, 55, 72, 240, 300);
        const saturation = 100;
        const lightness = scale(note.midi, 55, 72, 40, 50);
        element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        //grid.appendChild(element);
        gridOne.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          //grid.removeChild(element);
          gridOne.removeChild(element);
        }, time + duration + 0.02);
      }, time);
    }, time);
  });

  keysTwoNotes.forEach((note) => {
    let time = note.time;
    let duration = note.duration;
    // schedule append element based on note.time
    Transport.schedule(function (time) {
      Draw.schedule(function () {
        const element = document.createElement("div");
        const row = Math.floor(scale(note.midi, 55, 72, 1, 7));
        element.style.gridArea = `1 / ${row}/ 8 / ${row}`;

        const hue = scale(note.midi, 55, 72, 0, 70);
        const saturation = 100;
        const lightness = scale(note.midi, 55, 72, 40, 50);
        element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        //grid.appendChild(element);
        gridTwo.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          //grid.removeChild(element);
          gridTwo.removeChild(element);
        }, time + duration + 0.05);
      }, time);
    }, time);
  });
}

//-----------------------------------------------------------------------
// start transport
function start() {
  document.body.removeChild(startButton);
  document.body.appendChild(containerGrid);
  containerGrid.appendChild(gridTwo);
  containerGrid.appendChild(gridOne);
  Transport.start();
}
