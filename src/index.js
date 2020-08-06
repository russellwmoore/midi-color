import { Tone } from 'tone';
import { Midi } from '@tonejs/midi';
import { Player } from 'tone';
import { Buffer } from 'tone';
import { Draw } from 'tone';
import { Transport } from 'tone';
// import UnmuteButton from "unmute";
import { scale, shiftToBlue, getMidiFilesInfo } from './utils';
import * as styles from './styles';
import mobile from 'is-mobile';

// ideally note spread covers range of current 'piece'

// create start button
const startButton = document.createElement('div');
startButton.style = styles.buttonStyle;
startButton.addEventListener('click', start);
startButton.setAttribute('id', 'start');

const replayButton = document.createElement('div');
replayButton.style = styles.buttonStyle;
replayButton.addEventListener('click', replay);
replayButton.setAttribute('id', 'replay');

const startText = document.createElement('span');
startText.style = styles.messageStyle;
startText.innerText = 'start';

const replayText = document.createElement('span');
replayText.style = styles.messageStyle;
replayText.innerText = 'play again';

const soundMessage = document.createElement('span');
soundMessage.style = styles.messageStyleSmall;
soundMessage.innerText = '(turn on sound)';

// apply button styles
startButton.appendChild(startText);
startButton.appendChild(soundMessage);
replayButton.appendChild(replayText);

// create grids
const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'appContainer');

const containerGrid = document.createElement('div');
appContainer.setAttribute('id', 'containerGrid');

const state = {
  audioFile: null,
  midiFile: [],
  containerDivs: [],
  info: {},
};

const makeGridDiv = (id) => {
  const div = document.createElement('div');
  div.setAttribute('id', `grid-${id}`);
  div.style = styles.makeInnerGridStyle(state.info.hi - state.info.lo);
  return div;
};

// apply styles
appContainer.style = styles.appContainerStyle;
containerGrid.style = styles.containerGridStyle;

// append elements
document.body.appendChild(appContainer);
appContainer.appendChild(startButton);

//

// File input
// audio
const audioInputEl = document.getElementById('audio-input');
audioInputEl.addEventListener('change', handleAudioUpload, false);
const audioCtx = new (AudioContext || webkitAudioContext)();

// midi
const midiInputEl = document.getElementById('midi-input');
midiInputEl.addEventListener('change', handleMidiUpload, false);

// Get and process all midifiles from the upload and update state object.
async function handleMidiUpload() {
  try {
    const fileList = Array.prototype.slice.call(this.files);
    let blobs = await Promise.all(fileList.map((file) => file.arrayBuffer()));
    let midiFiles = blobs.map((blob) => new Midi(blob));
    state.midiFile = midiFiles;
    state.info = getMidiFilesInfo(state.midiFile);
    // make as many rows as there are midi tracks. TODO: make this work with several midi files with several midi tracks in them
    containerGrid.style = styles.makeContainerGridStyle(state.info.count);
    console.log('state after adding midi', state);
  } catch (error) {
    console.log('error in midi upload', error);
  }
}

// Get and process one mp3 file from the upload and update state object.

async function handleAudioUpload() {
  try {
    const file = this.files[0];
    const buffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buffer);
    state.audioFile = audioBuffer;
    console.log('audio loaded');
  } catch (error) {
    console.log('error in audio upload', error);
  }
}

//-----------------------------------------------------------------------
// schedule drawing based on midi note times
async function draw(midiFiles) {
  // TODO: amount of grids is determined by number of midi tracks. need to update for midifile with multiple tracks

  // make as many containers as we have tracks, give them ids based on the order in the container divs
  state.containerDivs = midiFiles
    .map((midiFile, idx) => {
      return midiFile.tracks.map((track, trackIdx) => {
        return makeGridDiv(idx + trackIdx);
      });
    })
    .flat();

  midiFiles.forEach((midiTrack, midiTrackIdx) => {
    midiTrack.tracks.forEach((track, trackIdx) => {
      track.notes.forEach((note) => {
        let time = note.time;
        let duration = note.duration;
        // schedule append element based on note.time
        Transport.schedule(function (time) {
          Draw.schedule(function () {
            const element = document.createElement('div');
            // const col = Math.floor(scale(note.midi, 55, 72, 1, 18));
            const col = Math.floor(
              scale(
                note.midi,
                state.info.lo,
                state.info.hi,
                1,
                state.info.hi - state.info.lo
              )
            );
            element.style.gridArea = `1 / ${col}/ 19 / ${col}`;

            const hue = scale(
              note.midi,
              state.info.lo,
              state.info.hi,
              240,
              300
            );
            const saturation = 100;
            const lightness = scale(
              note.midi,
              state.info.lo,
              state.info.hi,
              40,
              50
            );
            element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            state.containerDivs[midiTrackIdx + trackIdx].appendChild(element);

            // schedule remove element after note duration
            Draw.schedule(function () {
              state.containerDivs[midiTrackIdx + trackIdx].removeChild(element);
            }, time + duration);
          }, time);
        }, time);
      });
    });
  });
}

//-----------------------------------------------------------------------
function replay() {
  Transport.stop();
  Transport.position = 0;
  appContainer.removeChild(replayButton);
  appContainer.appendChild(containerGrid);
  Transport.start();
}

//-----------------------------------------------------------------------
// start transport
function start() {
  if (!state.audioFile) {
    window.alert('add an audio file tough guy');
    return;
  }
  if (!state.midiFile.length) {
    window.alert('add a midi file tough guy');
    return;
  }
  console.log('start', state);
  const unmuteButton = document.querySelector('#unmute-button');
  const player = new Player({
    url: state.audioFile,
    fadeIn: 0,
    fadeOut: 0.1,
  }).toMaster();
  player.sync().start();
  //

  console.log('loaded', state);

  draw(state.midiFile).then(() => {
    appContainer.removeChild(startButton);
    appContainer.appendChild(containerGrid);
    // create with the correct varaibles the container and the grids
    state.containerDivs.forEach((cd) => {
      containerGrid.appendChild(cd);
    });

    const id = setTimeout(() => {
      console.log('done');
      appContainer.removeChild(containerGrid);
      appContainer.appendChild(replayButton);
      clearTimeout(id);
    }, player.buffer.duration * 1000);

    // Transport.loop = true;
    // Transport.bpm.value = 114;
    // Transport.loopStart = 0;
    // Transport.loopEnd = player.buffer.duration;
    const pressed = unmuteButton.getAttribute('aria-pressed');
    if (mobile({ tablet: true })) {
      unmuteButton.click();
    }
    // Transport.bpm.value = 10;

    Transport.start();

    document.body.removeChild(unmuteButton);
  });
}
