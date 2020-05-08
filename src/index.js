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
document.body.appendChild(stopButton);

// create Tone.Player
const player = new Player("./audio/keys.mp3", {
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
  const midi = await Midi.fromUrl("./midi/keys.mid");

  // get notes from first track
  const notes = midi.tracks[0].notes;

  //loop through notes
  notes.forEach((note) => {
    // schedule append element based on note.time
    Draw.schedule(function () {
      const element = document.createElement("div");
      element.setAttribute("id", "yellow-rectangle");
      element.style.width = "100%";
      element.style.height = "2px";
      element.style.background = "yellow";
      element.style.marginTop = "30px";
      document.body.appendChild(element);

      // schedule remove element after note duration
      Draw.schedule(function () {
        document.body.removeChild(element);
      }, note.time + note.duration);
    }, note.time);
  });
}

// start transport and trigger append elements
function start() {
  console.log("start");
  Transport.start();
  draw();
}

// stop transport and cancel scheduled Draw events.
// TODO: Figure out why Draw does not start from zero after stop
function stop() {
  Draw.cancel();
  Transport.stop();
}
