import mobile from 'is-mobile';

const height = mobile() ? window.innerHeight + 'px' : '100vh';

// styles
export const buttonStyle = `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 150px;
  background: yellow;
  cursor: pointer;
`;

export const inputStyle = `
width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

export const messageStyle = `
  font-family: monospace;
  font-size: 2em;
`;

export const messageStyleSmall = `
  font-family: monospace;
  font-size: 2em;
`;
export const appContainerStyle = `
  display: grid;
  height: ${height};
  width: 100%;
  align-items: center;
  justify-items: center;
  box-sizing: border-box;
`;
// innerGridStyles ignore rows for now. Maybe we can use them in a creative way later?
export const innerGridStyle = ` 
  position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: repeat(18, 1fr);
  /*grid-template-rows: repeat(18, 1fr);*/
  box-sizing: border-box;
`;

export const makeInnerGridStyle = (rangeOfNotes) => {
  return `
   position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: repeat(${rangeOfNotes}, 1fr);
  /*grid-template-rows: repeat(${rangeOfNotes}, 1fr);*/
  box-sizing: border-box;`;
};

export const containerGridStyle = `
  display: grid;
  height: 100%;
  width: 100%;
  align-items: center;

  grid-template-columns: 1fr;
  grid-template-rows: repeat(6,1fr);
  box-sizing: border-box;
`;

export const makeContainerGridStyle = (numberOfTracks) => {
  return `
    display: grid;
    height: 100%;
    width: 100%;
    align-items: center;

    grid-template-columns: 1fr;
    grid-template-rows: repeat(${numberOfTracks}, 1fr);
    box-sizing: border-box;
  `;
};
