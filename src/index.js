import { Tone } from 'tone';
import { Midi } from '@tonejs/midi';
import { Player } from 'tone';
import { Buffer } from 'tone';
import { Draw } from 'tone';
import { Transport } from 'tone';
// import UnmuteButton from "unmute";
import { scale, shiftToBlue } from './utils';
import * as styles from './styles';
import mobile from 'is-mobile';

import midiFile from 'midi-file';

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

const makeGridDiv = (id) => {
  const div = document.createElement('div');
  div.setAttribute('id', `grid-${id}`);
  div.style = styles.innerGridStyle;
  return div;
};

// apply styles
appContainer.style = styles.appContainerStyle;
containerGrid.style = styles.containerGridStyle;

// append elements
document.body.appendChild(appContainer);
appContainer.appendChild(startButton);

//
const state = {
  audioFile: null,
  midiFile: [],
  containerDivs: [],
};

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
    // make as many rows as there are midi tracks. TODO: make this work with several midi files with several midi tracks in them
    containerGrid.style = styles.makeContainerGridStyle(state.midiFile.length);
  } catch (error) {
    console.log('error in midi upload', error);
  }
}

async function handleAudioUpload() {
  try {
    const file = this.files[0];
    const buffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buffer);
    state.audioFile = audioBuffer;
  } catch (error) {
    console.log('error in audio upload', error);
  }
}

//-----------------------------------------------------------------------
// schedule drawing based on midi note times
async function draw(midiFiles) {
  // TODO: amount of grids is determined by number of midi tracks.
  console.log(midiFiles);
  let allKeys = midiFiles;
  // make as many containers as we have tracks, give them ids based on the order in the container divs
  state.containerDivs = allKeys.map((singleKey, idx) => {
    return makeGridDiv(idx);
  });

  allKeys.forEach((midiTrack, idx) => {
    // TODO: update this function to handle a midi file with multiple tracks
    midiTrack.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        // console.log(note);
        let time = note.time;
        let duration = note.duration;
        // schedule append element based on note.time
        Transport.schedule(function (time) {
          Draw.schedule(function () {
            const element = document.createElement('div');
            const col = Math.floor(scale(note.midi, 55, 72, 1, 18));
            element.style.gridArea = `1 / ${col}/ 19 / ${col}`;

            const hue = scale(note.midi, 55, 72, 240, 300);
            const saturation = 100;
            const lightness = scale(note.midi, 55, 72, 40, 50);
            element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            state.containerDivs[idx].appendChild(element);

            // schedule remove element after note duration
            Draw.schedule(function () {
              state.containerDivs[idx].removeChild(element);
            }, time + duration + 0.05);
          }, time);
        }, time);
      });
    });
  });
  // console.log(keysOne);

  // loop through keysOneNotes
  // keysOneNotes.forEach((note) => {
  //   let time = note.time;
  //   let duration = note.duration;
  //   // schedule append element based on note.time
  //   Transport.schedule(function (time) {
  //     Draw.schedule(function () {
  //       const element = document.createElement('div');
  //       const row = Math.floor(scale(note.midi, 55, 72, 1, 18));
  //       element.style.gridArea = `${Math.floor(Math.random()* 19)} / ${row}/ ${Math.floor(Math.random()* 19)} / ${row}`;

  //       const hue = scale(note.midi, 55, 72, 240, 300);
  //       const saturation = 100;
  //       const lightness = scale(note.midi, 55, 72, 40, 50);
  //       element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  //       gridOne.appendChild(element);

  //       // schedule remove element after note duration
  //       Draw.schedule(function () {
  //         gridOne.removeChild(element);
  //       }, time + duration + 0.05);
  //     }, time);
  //   }, time);
  // });

  // keysTwoNotes.forEach((note) => {
  //   let time = note.time;
  //   let duration = note.duration;
  //   // schedule append element based on note.time
  //   Transport.schedule(function (time) {
  //     Draw.schedule(function () {
  //       const element = document.createElement('div');
  //       const row = Math.floor(scale(note.midi, 55, 72, 1, 18));
  //       element.style.gridArea = `1 / ${row}/ 19 / ${row}`;

  //       const hue = scale(note.midi, 55, 72, 0, 70);
  //       const saturation = 100;
  //       const lightness = scale(note.midi, 55, 72, 40, 50);
  //       element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  //       gridTwo.appendChild(element);

  //       // schedule remove element after note duration
  //       Draw.schedule(function () {
  //         gridTwo.removeChild(element);
  //       }, time + duration + 0.05);
  //     }, time);
  //   }, time);
  // });
}

//-----------------------------------------------------------------------
function replay() {
  Transport.stop();
  Transport.position = 0;
  appContainer.removeChild(replayButton);
  appContainer.appendChild(containerGrid);
  // containerGrid.appendChild(gridTwo);
  // containerGrid.appendChild(gridOne);
  state.containerDivs.forEach((cd) => {
    cd.style = styles.innerGridStyle;
    containerGrid.appendChild(cd);
  });
  // Player.seek(0);
  Transport.start();
}

//-----------------------------------------------------------------------
// start transport
function start() {
  console.log('start', state);
  const unmuteButton = document.querySelector('#unmute-button');
  const player = new Player({
    // url: './audio/bachAudio.mp3',
    url: state.audioFile,
    fadeIn: 0,
    fadeOut: 0.1,
  }).toMaster();
  player.sync().start();
  //

  console.log('loaded', state);
  draw(
    // './midi/bachChords.mid',
    // './midi/bachKeys2.mid',
    // './midi/bachKeys1.mid',
    // './midi/bachChords.mid',
    // './midi/bachKeys2.mid',
    // './midi/bachKeys1.mid',
    state.midiFile
  ).then(() => {
    // TODO: draw needs to take in midi URLs. Where should theys get them? Also need to make enough grids for each midi track.
    //unmuteButton.click();
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

    //

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
