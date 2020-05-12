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
    let time = note.time;
    let duration = note.duration;
    // schedule append element based on note.time
    Transport.schedule(function (time) {
      Draw.schedule(function () {
        const element = document.createElement("div");
        element.setAttribute("id", "yellow-rectangle");
        element.style.position = "absolute";
        element.style.left = note.midi + "vw";
        element.style.top = 0;
        element.style.width = "20px";
        element.style.height = "100%";
        element.style.background = "red";
        document.body.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          document.body.removeChild(element);
        }, time + duration);
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
        element.setAttribute("id", "yellow-rectangle");
        element.style.position = "absolute";
        element.style.top = (100 - note.midi) * 15 - 300 + "px";
        element.style.width = "100%";
        element.style.height = "10px";
        element.style.background = "blue";
        element.style.marginTop = "30px";
        document.body.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          document.body.removeChild(element);
        }, time + duration);
      }, time);
    }, time);
  });
}

// start transport
function start() {
  document.body.removeChild(startButton);
  Transport.start();
}
