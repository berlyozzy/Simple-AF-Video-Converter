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

window.electron.SendToChild();

window.addEventListener("message", (event) => {

    if (event.source === window) {

        const { data : { target, message } } = event;

        if(target == "parent"){
            return
        }

        const custom_event = new CustomEvent('ChildContent', { detail : { message } });
        window.dispatchEvent(custom_event);

    }

});