window.addEventListener('custom_window', async ({detail}) => {

    switch (detail) {
        case "minimize":

            window.electron.Minimize();
            break;

        case "close":

            window.electron.Close();
            break;

        case "size":

            window.electron.Size();
            break;

    }
    
});

window.addEventListener('OpenLink', async ({detail}) => window.electron.OpenLink(detail));

window.addEventListener('OpenFolder', async () => {

    const path = await window.electron.OpenFolder();
    const event = new CustomEvent('newSavePath', { detail : { path } });
    window.dispatchEvent(event);
    
});

window.addEventListener('getPresets', async () => {

    const data = await window.electron.GetPresets();
    const event = new CustomEvent('setPresets', { detail : { data } });
    window.dispatchEvent(event);
    
});

window.addEventListener('updatePresets', async ({detail : { current_presets }}) => {

    const result = await window.electron.UpdatePresets(current_presets);

    if(result){
        const data = await window.electron.GetPresets();
        const event = new CustomEvent('setPresets', { detail : { data } });
        window.dispatchEvent(event);
    }
    
});

window.addEventListener('OpenChild', async ({detail}) => {
    window.electron.OpenChild(detail);
});

window.addEventListener('convert:Send', async ({detail}) => {

    const result = await window.electron.ConvertFiles(detail);
    const event = new CustomEvent('convert:Completed', { detail : { result }});
    window.dispatchEvent(event);
    
});

window.electron.ConvertProgress();
window.electron.GetDefaultPaths();

window.addEventListener("message", (event) => {

    if (event.source === window) {

        const { data : { target, type, message } } = event;

        if(target == "child"){
            return
        }

        let custom_event;

        switch (type) {
            case "paths":
                custom_event = new CustomEvent('SetDefaultPaths', { detail : { message } });
                break;
        
            default:
                custom_event = new CustomEvent('progress', { detail : { message } });
                break;
        }

        window.dispatchEvent(custom_event);


    }

});
