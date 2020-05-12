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
        //element.setAttribute("id", "yellow-rectangle");
        element.style.position = "absolute";
        element.style.bottom = scale(note.midi, 55, 72, 40, 60) + "vh";
        element.style.width = "100%";
        element.style.height = "20px";

        const hue = scale(note.midi, 55, 72, 240, 300);
        const saturation = 100;
        const lightness = scale(note.midi, 55, 72, 40, 50);
        element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        document.body.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          document.body.removeChild(element);
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
        //element.setAttribute("id", "yellow-rectangle");
        element.style.position = "absolute";
        element.style.left = scale(note.midi, 55, 72, 40, 60) + "vw";
        element.style.top = 0;
        element.style.width = "10px";
        element.style.height = "100%";

        const hue = scale(note.midi, 55, 72, 0, 70);
        const saturation = 100;
        const lightness = scale(note.midi, 55, 72, 40, 50);
        element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        element.style.marginTop = "30px";
        document.body.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          document.body.removeChild(element);
        }, time + duration + 0.05);
      }, time);
    }, time);
  });
}

//-----------------------------------------------------------------------
// start transport
function start() {
  document.body.removeChild(startButton);
  Transport.start();
}
