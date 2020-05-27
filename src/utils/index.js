//-----------------------------------------------------------------------
export function shiftToBlue(val) {
  const shifted = parseFloat(val) + 240;
  if (shifted >= 360) {
    return shifted - 360;
  }
  return shifted;
}

//-----------------------------------------------------------------------
export function scale(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

//-----------------------------------------------------------------------
export function getHiAndLoNoteValues(midiArr) {
  const hiLo = {
    lo: Infinity,
    hi: -Infinity,
  };

  midiArr.forEach((midi) => {
    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        hiLo.lo = Math.min(note.midi, hiLo.lo);
        hiLo.hi = Math.max(note.midi, hiLo.hi);
      });
    });
  });
  return hiLo;
}
