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
export function getMidiFilesInfo(midiArr) {
  const info = {
    lo: Infinity,
    hi: -Infinity,
    count: 0,
  };
  // midiArr.forEach((midiFile) => {
  //   midiFile.tracks = midiFile.tracks.filter((single) => {
  //     return single.notes.length;
  //   });
  // });

  midiArr.forEach((midi) => {
    midi.tracks.forEach((track) => {
      info.count++;
      track.notes.forEach((note) => {
        info.lo = Math.min(note.midi, info.lo);
        info.hi = Math.max(note.midi, info.hi);
      });
    });
  });
  return info;
}
