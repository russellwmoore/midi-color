import { Midi } from "@tonejs/midi";
import { Transport } from "tone";
import { Player } from "tone";
import { Buffer } from "tone";
import { Draw } from "tone";

// create start button
const startButton = document.createElement("button");
startButton.setAttribute("id", "start");
startButton.innerText = "start";
startButton.setAttribute("disabled", true);
startButton.addEventListener("click", start);
document.body.appendChild(startButton);

// create stop button
const stopButton = document.createElement("button");
stopButton.setAttribute("id", "stop");
stopButton.innerText = "stop";
stopButton.addEventListener("click", stop);
//document.body.appendChild(stopButton);

const keysOneContainer = document.createElement("div");
keysOneContainer.style.width = "100%";
keysOneContainer.style.height = "100px";
document.body.appendChild(keysOneContainer);

// create Tone.Player
const player = new Player("./audio/bachAudio.mp3", {
  autoplay: false,
}).toMaster();
player.sync().start();

// enable start button when audio file loaded
Buffer.on("load", () => {
  startButton.removeAttribute("disabled");
});

// append/remove elements from dom based on midi note times
async function draw() {
  // get midi data
  const keysOne = await Midi.fromUrl("./midi/bachKeys1.mid");
  const keysTwo = await Midi.fromUrl("./midi/bachKeys2.mid");

  // get notes from first track
  const keysOneNotes = keysOne.tracks[0].notes;
  const keysTwoNotes = keysTwo.tracks[0].notes;

  //loop through keysOneNotes
  keysOneNotes.forEach((note) => {
    // schedule append element based on note.time
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
      }, note.time + note.duration);
    }, note.time);
  });

  keysTwoNotes.forEach((note) => {
    console.log(note);
    // schedule append element based on note.time
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
      }, note.time + note.duration + 0.06);
    }, note.time);
  });
}

// start transport and trigger append elements
function start() {
  document.body.removeChild(startButton);
  Transport.start();
  draw();
}

// stop transport and cancel scheduled Draw events.
// TODO: Figure out why Draw does not start from zero after stop
function stop() {
  startButton.removeAttribute("disabled");
  Draw.cancel();
  Transport.stop();
}
