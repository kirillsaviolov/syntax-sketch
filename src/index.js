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
    window.webContents.executeJavaScript('activateSearch()');
  });
  window.on('closed', onClose);

  return window;
}

function parse(selection) {
  if (selection.count() && selection[0] instanceof MSSymbolInstance) {
    for (let key in config.names) {
      const set = [key, ...(config.names[key].aliases || [])];
      const regexp = `${set.join('|')}\/`
      const matches = selection[0].name().match(regexp);

      if (matches) {
        return key;
      }
    }
  }
}

export default function(context) {
  const threadDictionary = NSThread.mainThread().threadDictionary();
  const id = 'syntax';

  if (threadDictionary[id]) {
    return;
  }

  const window = openWindow(parse(context.selection), () => {
    threadDictionary[id] = null;
  });
  threadDictionary[id] = window;
}
