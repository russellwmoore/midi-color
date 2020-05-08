import { Midi } from "@tonejs/midi";
import { Transport } from "tone";
import { Player } from "tone";
import { Buffer } from "tone";

const startButton = document.createElement("button");
startButton.setAttribute("id", "start");
startButton.innerText = "start";
startButton.setAttribute("disabled", true);
document.body.appendChild(startButton);

const player = new Player("./audio/keys.mp3", {
  autoplay: false,
}).toMaster();

player.sync().start();

startButton.addEventListener("click", () => {
  start();
});

Buffer.on("load", () => {
  console.log("loaded");
  startButton.removeAttribute("disabled");
});

async function draw() {
  const midi = await Midi.fromUrl("./midi/keys.mid");

  const notes = midi.tracks[0].notes;

  //
  notes.map((note) => {
    console.log(note);
    Transport.schedule(function (time) {
      console.log(time);
      const element = document.createElement("div");
      element.setAttribute("id", "yellow-rectangle");
      element.style.width = "100%";
      element.style.height = "2px";
      element.style.background = "yellow";
      element.style.marginTop = "30px";
      document.body.appendChild(element);

      Transport.schedule(function (endTime) {
        document.body.removeChild(element);
      }, note.time + note.duration);
    }, note.time);
  });
}

function start() {
  Transport.start();
  draw();
}

// const startButton = document.querySelector("#start");
// startButton.addEventListener("click", start);
