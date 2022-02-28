const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {

    Minimize: async () => {
      ipcRenderer.send("Minimize");
    },
    Close: async () => {
      ipcRenderer.send("Close");
    },
    Size: async () => {
      ipcRenderer.send("Size");
    },
    OpenFolder: async () => {

      return await ipcRenderer.invoke("openFolder");

    },
    OpenChild: async (data) => {
      ipcRenderer.send("OpenChild", data);
    },
    ConvertFiles : async (details) => {

      return await ipcRenderer.invoke("convertFile", details);

    },
    ConvertProgress : async () => {

      ipcRenderer.on('progress', (event, message) => {
        window.postMessage({ target : "parent", type: "progress", message }, "*");
      })

    },
    GetDefaultPaths : async () => {

      ipcRenderer.on('getDefaultPaths', (event, message) => {
        window.postMessage({ target : "parent", type: "paths", message }, "*");
      })

    },
    GetPresets : async () => {

      return await ipcRenderer.invoke("getPresets");

    },
    UpdatePresets : async (data) => {

      return await ipcRenderer.invoke("updatePresets", data);

    },
    SendToChild : async () => {

      ipcRenderer.on('ChildContent', (event, message) => {
        window.postMessage({ target : "child", message }, "*");
      })

    },
    OpenLink: async (link) => {
      shell.openExternal(link);  
    },
  }


);


