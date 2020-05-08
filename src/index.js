import { Midi } from "@tonejs/midi";
import { Transport } from "tone";

async function logMidi() {
  const midi = await Midi.fromUrl("./midi/keys.mid");

  const notes = midi.tracks[0].notes;

  notes.map((note) => {
    Transport.schedule(function (time) {
      console.log(time);
      const element = document.createElement("div");
      element.innerText = "heyman from index";
      element.style.background = "yellow";
      document.body.appendChild(element);
    }, note.time);
  });
}

function start(e) {
  e.preventDefault();
  Transport.start();
  logMidi();
}

const startButton = document.querySelector("#start");
startButton.addEventListener("click", start);
