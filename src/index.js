import { Midi } from "@tonejs/midi";
import { Transport } from "tone";

async function logMidi() {
  const midi = await Midi.fromUrl("./midi/keys.mid");

  const notes = midi.tracks[0].notes;

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

function start(e) {
  e.preventDefault();
  Transport.start();
  logMidi();
}

const startButton = document.querySelector("#start");
startButton.addEventListener("click", start);
