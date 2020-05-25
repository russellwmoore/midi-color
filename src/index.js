import { Tone } from 'tone';
import { Midi } from '@tonejs/midi';
import { Player } from 'tone';
import { Buffer } from 'tone';
import { Draw } from 'tone';
import { Transport } from 'tone';
// import UnmuteButton from "unmute";
import mobile from 'is-mobile';

const height = mobile() ? window.innerHeight + 'px' : '100vh';

// styles
const buttonStyle = `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 150px;
  background: yellow;
  cursor: pointer;
`;

const messageStyle = `
  font-family: monospace;
  font-size: 2em;
`;

const messageStyleSmall = `
  font-family: monospace;
  font-size: 2em;
`;
const appContainerStyle = `
  display: grid;
  height: ${height};
  width: 100%;
  align-items: center;
  justify-items: center;
  box-sizing: border-box;
`;

const innerGridStyle = ` 
  position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: repeat(18, 1fr);
  grid-template-rows: repeat(18, 1fr);
  box-sizing: border-box;
`;

const containerGridStyle = `
  display: grid;
  height: 100%;
  width: 100%;
  align-items: center;

  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  box-sizing: border-box;
`;

// ideally note spread covers range of current 'piece'

// create start button
const startButton = document.createElement('div');
startButton.style = buttonStyle;
startButton.addEventListener('click', start);
startButton.setAttribute('id', 'start');

const replayButton = document.createElement('div');
replayButton.style = buttonStyle;
replayButton.addEventListener('click', replay);
replayButton.setAttribute('id', 'replay');

const startText = document.createElement('span');
startText.style = messageStyle;
startText.innerText = 'start';

const replayText = document.createElement('span');
replayText.style = messageStyle;
replayText.innerText = 'play again';

const soundMessage = document.createElement('span');
soundMessage.style = messageStyleSmall;
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

// const gridOne = document.createElement('div'); // TODO: make function that creates  to dynamically make these along with how many midi tracks there are
// gridOne.setAttribute('id', 'gridOne');

const makeGridDiv = (id) => {
  const div = document.createElement('div');
  div.setAttribute('id', `grid-${id}`);
  return div;
};
// const gridTwo = document.createElement('div');
// gridTwo.setAttribute('id', 'gridTwo');

let containerDivs = [];
// apply styles
appContainer.style = appContainerStyle;
containerGrid.style = containerGridStyle;
// gridOne.style = innerGridStyle;
// gridTwo.style = innerGridStyle;

// append elements
document.body.appendChild(appContainer);
appContainer.appendChild(startButton);

// create Tone.Player
const player = new Player({
  url: './audio/bachAudio.mp3',
  fadeIn: 0,
  fadeOut: 0.1,
}).toMaster();
player.sync().start();

// on audio load, schedule drawing
Buffer.on('load', () => {
  draw([
    './midi/bachChords.mid',
    './midi/bachKeys2.mid',
    './midi/bachKeys1.mid',
  ]); // TODO: draw needs to take in midi URLs. Where should theys get them? Also need to make enough grids for each midi track.
});

//-----------------------------------------------------------------------
function shiftToBlue(val) {
  const shifted = parseFloat(val) + 240;
  if (shifted >= 360) {
    return shifted - 360;
  }
  return shifted;
}

//-----------------------------------------------------------------------
function scale(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

//-----------------------------------------------------------------------
// schedule drawing based on midi note times
async function draw(midiURLs) {
  // TODO: amount of grids is determined by number of midi tracks. Could use array indexes here.
  // get midi data
  const allKeys = await Promise.all(
    midiURLs.map((midiURL) => Midi.fromUrl(midiURL))
  );
  console.log('allkeys', allKeys);
  // const keysOne = await Midi.fromUrl('./midi/bachKeys1.mid');
  // const keysTwo = await Midi.fromUrl('./midi/bachKeys2.mid');
  // const keysThree = await Midi.fromUrl('./midi/keys.mid');
  // console.log(keysTwo);
  // get notes from first track
  // const keysOneNotes = keysOne.tracks[0].notes;
  // const keysTwoNotes = keysTwo.tracks[0].notes;

  // make as many containers as we have tracks
  containerDivs = allKeys.map((singleKey, idx) => {
    return makeGridDiv(idx);
  });

  allKeys.forEach((midiTrack, idx) => {
    console.log('mTrack', midiTrack, idx);
    midiTrack.tracks[0].notes.forEach((note) => {
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
          console.log(containerDivs[idx]);
          containerDivs[idx].appendChild(element);

          // schedule remove element after note duration
          Draw.schedule(function () {
            containerDivs[idx].removeChild(element);
          }, time + duration + 0.05);
        }, time);
      }, time);
    });
  });
  console.log(keysOne);

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
  containerDivs.forEach((cd) => {
    cd.style = innerGridStyle;
    containerGrid.appendChild(cd);
  });
  // Player.seek(0);
  // Transport.bpm.value = 60;
  Transport.start();
}

//-----------------------------------------------------------------------
// start transport
function start() {
  const unmuteButton = document.querySelector('#unmute-button');

  //unmuteButton.click();
  appContainer.removeChild(startButton);
  appContainer.appendChild(containerGrid);
  // create with the correct varaibles the container and the grids
  containerDivs.forEach((cd) => {
    cd.style = innerGridStyle;
    containerGrid.appendChild(cd);
  });
  // containerGrid.appendChild(gridTwo);
  // containerGrid.appendChild(gridOne);

  setTimeout(() => {
    console.log('done');
    appContainer.removeChild(containerGrid);
    appContainer.appendChild(replayButton);
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
}
