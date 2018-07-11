import BrowserWindow from 'sketch-module-web-view';
import config from './config.json';

function openWindow(name, onClose) {
  const window = new BrowserWindow({
    title: 'Syntax',
    width: 1280,
    height: 768,
    center: true,
    show: false
  });
  window.loadURL(`${config.url}/#/en-US/${name}`);
  window.once('ready-to-show', () => {
    window.show();
  });
  window.on('closed', onClose);
  window.moveTop();

  return window;
}

function parse(selection) {
  if (selection.count() === 0) {
    return;
  }

  const type = selection[0].class().toString().trim();
  const name = selection[0].name();

  if (isValidType(type)) {
    for (let key in config.names) {
      const set = [key, ...(config.names[key].aliases || [])];
      const regexps = [
        new RegExp('^' + set.join('|') + '$', 'i'),
        new RegExp('__(' + set.join('|') + ')\/', 'i')
      ];
      const matches = regexps.reduce((result, regexp) => {
        result = result || name.match(regexp);
        return result;
      }, null);

      if (matches) {
        return key;
      }
    }
  }
}

function isValidType(type) {
  switch(type) {
    case 'MSLayerGroup':
    case 'MSShapeGroup':
    case 'MSSymbolInstance':
    case 'MSTextLayer':
      return true;
  }
  return false;
}

export default function(context) {
  const threadDictionary = NSThread.mainThread().threadDictionary();
  const id = 'syntax';
  const name = parse(context.selection);

  if (threadDictionary[id] && threadDictionary[id].window) {
    const {currentName, window} = threadDictionary[id];

    if (currentName !== name) {
      window.loadURL(`${config.url}/#/en-US/${name}`);
      window.moveTop();
    }
    return;
  }

  const window = openWindow(name, () => {
    threadDictionary[id] = null;
  });
  threadDictionary[id] = {
    currentName: name,
    window
  };
}
