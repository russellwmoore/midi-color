import { Midi } from "@tonejs/midi";

async function logMidi() {
  const midi = await Midi.fromUrl("./midi/keys.mid");

  const notes = midi.tracks[0].notes;

  notes.map((note) => console.log(note));
}

logMidi();
