<script>
    import { createEventDispatcher } from 'svelte';
    import Fa from 'svelte-fa';
	import { faFileUpload } from '@fortawesome/free-solid-svg-icons';

    const dispatch = createEventDispatcher();

    const UploadHandler = ({dataTransfer, clipboardData, target}) => {

        const file_list = dataTransfer && dataTransfer.files !== undefined ? dataTransfer.files : clipboardData && clipboardData.files !== undefined ? clipboardData.files : target.files;

        if(file_list.length == 0){
            return false
        }else{
            getMetadataForFileList(file_list);
        }

    }

    async function readFileAsDataURL(file) {

        let url = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result);
            fileReader.readAsDataURL(file);
        });

        return url;

    }

    const generateVideoThumbnail = (file) => {

        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const video = document.createElement("video");

            video.autoplay = true;
            video.muted = true;
            video.src = file;

            video.onloadeddata = () => {
                let ctx = canvas.getContext("2d");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                video.pause();
                return resolve(canvas.toDataURL("image/jpg"));
            };
        });

    };


    const getMetadataForFileList = async (fileList) => {

        let output = [];

        for (const file of fileList) {
            const name = file.name.toLowerCase();
            const type = file.type;

            const url = await readFileAsDataURL(file);
            const thumb = await generateVideoThumbnail(url);
            const head = 'data:image/jpg;base64,';
            const thumbSize = Math.round((thumb.length - head.length)*3/4) ;

            output.push({
                name,
                type,
                file,
                thumb : thumbSize > 100000 ? thumb : "images/placeholder.jpg",
                isIncluded : true
            })
        }

        dispatch("files", {FileList : output})

    }

</script>

<div class="content-drop drop-position"
        on:drop|preventDefault={UploadHandler}
        ondragover="return false"
    >
        <span class="file-background">
            <span class="content-drop-icon is-unselectable">
                <Fa icon={faFileUpload} size="5x"/>
            </span>
            <span class="content-drop-message is-unselectable">
                <p style="text-align: center;">Drop your file/s here ☕</p>
            </span>
        </span>
        <label class="file-label">
            <input
                on:change={UploadHandler}
                class="file-input"
                type="file"
                accept="video/*"
                multiple
            />
            <span class="file-cta" contenteditable="true" on:paste|preventDefault={UploadHandler}> </span>
        </label>
</div>

<style>

    .content-drop{
        position: relative;
        height: 100%;
        width: 100%;
        border-radius: 0;
        background: var(--eerie-black);
    }

    .content-drop:hover{
        background: var(--middle);
    }

    .content-drop:hover .content-drop-icon, .content-drop:hover :global(.content-drop-icon svg), .content-drop:hover .content-drop-message{
        color: var(--warning) !important;
    }

    .content-drop-icon{
        opacity: 0.7;
        align-self: end;
        color: var(--another-text);
    }

    .content-drop-message
    {
        align-self: start;
        font-weight: bold;
        font-size: 0.9em;
        color: var(--another-text);

    }

    .file-label{
        height: 100%;
        position: absolute; 
        width: 100%; 
        top: 0;
    }

    .file-background{
        display: grid; 
        width: 100%; 
        height: 100%;
        place-items: center;
        gap: 1em;
        grid-template-rows: calc(55% - 0.5em) calc(45% - 0.5em)
    }

    .file-cta{
        opacity: 0;
        height: 100%;
        width: 100%;
        grid-template-columns: 100%;
        display: grid;
        gap: 5px;
        place-items: center;
        background: transparent !important;
        border: 0 !important;
    }
</style>