<script>
	import Menu from 'components/toolsbar.svelte';
    import Section from 'components/section.svelte';
    import Upload from 'components/upload.svelte';
    import List from 'components/list.svelte';
    import Output from 'components/output.svelte';
    import Prism from 'prismjs';
    import Fa from 'svelte-fa';
    import Modal from 'components/modal.svelte';
    import 'prismjs/components/prism-log';
    import "prismjs/themes/prism-tomorrow.min.css";

    import { SvelteToast } from '@zerodevx/svelte-toast';
    import { toast } from '@zerodevx/svelte-toast'
    import { onMount, tick } from 'svelte';
    import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
    import { default_video, default_documents, custom_save_path } from 'stores/stores.js';

    let isUpload = true;
    let FilesToRender = [];
    const logger_output_template = {
        frame: '--',
        fps: '--',
        q: '--',
        size: '--',
        time: '--',
        bitrate: '--',
        dup: '--',
        drop: '--',
        speed: '--'
    };
    $: logger_message = logger_output_template;
    $: logger_html_string = ""
    let logger_backup = {};
    let logger_message_raw = "Log:\n";
    let log_display;
    let has_valid_name = false;
    let has_valid_extension = false;
    let is_modal_open = false;
    let is_in_progress = false;
    let current_presets = [];

    const DisplayFiles = ({detail : { FileList }}) => {
        isUpload = false;
        FilesToRender = FileList;
    }

    const toast_options = {
        duration: 3000,
        initial: 0,
        next: 1
    }

    const inputStyles = "grid-template-rows: max-content auto";
    const outputStyles = "grid-template-rows: repeat(6, max-content) auto; position: relative";
    const progressStyles = "grid-column-start: 1; grid-column-end: 3; grid-template-columns: 30% 70%; padding: 0; position: relative";

    const ParseLoggerMessage = (message) => {
        let matches = message.match(/(\S*)=\s*(\d*[.0-9:]*(kB|kbits\/s|x)?)/gm);

        if (matches != null && matches.length != 0) {

            let template = Object.assign({}, logger_output_template)

            matches.forEach(e => {
                e = e.split("="); 

                if(e[1].trim() != "" && e[1].trim() != "undefined"){

                    if(e[1].trim() == "Lsize"){
                        template["size"] = e[1].trim()
                    }else{
                        template[e[0].trim()] = e[1].trim()
                    }

                }else{
                    template[e[0].trim()] = "--"
                }

            })

            logger_backup = template;

            return template
            
        }else{

            if(Object.keys(logger_backup).length != 0){
                return logger_backup
            }else{
                return logger_output_template
            }

        }
    }

    const DisplayLogs = async ({detail : { message }}) => {
        logger_message_raw += `\n${message}`;
        logger_html_string = Prism.highlight(logger_message_raw, Prism.languages.log);
        logger_message = ParseLoggerMessage(message);
        await tick();
        log_display.firstElementChild.scrollIntoView({behaviour: "smooth", block: "end", inline: "center"})
    }

    const ConfirmValidName = ({detail : { isNameValid }}) => {
        has_valid_name = isNameValid;
    }

    const ConfirmValidExtension = ({detail : { isExtensionValid }}) => {
        has_valid_extension = isExtensionValid;
    }

    const ConvertFiles = ({detail : { args }}) => {

        if(!has_valid_name || !has_valid_extension){
            toast.push('Invalid new file name');
            const event = new CustomEvent('convert:Cancel:Not-Started');
            window.dispatchEvent(event);
            return
        }

        is_in_progress = true;
        const event = new CustomEvent('convert:Send', {detail : args});
        window.dispatchEvent(event);

    }

    const OpenChildPage = () => {
        const event = new CustomEvent('OpenChild', { detail : { logger : logger_html_string }});
        window.dispatchEvent(event);
    }

    const SetPaths = ({detail : { message : { presets , videos } }}) => {
        $default_documents = presets;
        $default_video = videos;
        $custom_save_path = $default_video;
    }

    const OpenModal = ({detail : { presets }}) => {
        current_presets = presets;
        is_modal_open = true;
    }

    const CloseModal = () => {
        current_presets = [];
        is_modal_open = false;
    }

    onMount(() => {

        window.addEventListener("progress", DisplayLogs );
        window.addEventListener("SetDefaultPaths", SetPaths );

    })

</script>

<main>
    <Menu />
	<div class="body">
        <Section style={inputStyles}>

            <h3>Input</h3>

            {#if isUpload}
            <Upload on:files={DisplayFiles}/>
            {:else}
            <List 
                files={FilesToRender} 
                on:cancel={_ => {
                    isUpload = true;
                    FilesToRender = [];
                }}
                on:convert={ConvertFiles}
                on:completed={_ => is_in_progress = false}
            />
            {/if}

        </Section>

        <Section style={outputStyles}>

            <h3>Output</h3>

            {#if is_in_progress}
            <div class="output-block is-unselectable"></div>
            {/if}

            <Output on:name={ConfirmValidName} on:extension={ConfirmValidExtension} on:new={OpenModal} />

        </Section>

        <Section style={progressStyles}>

            <div class="child-window-toggle">
                <span class="icon is-clickable" on:click={OpenChildPage}>
                    <Fa icon={faExternalLinkAlt} />
                </span>
            </div>

            <div class="progress-details">
                <p>
                    frame :
                    <span class="value">{logger_message.frame}</span>
                </p>
                <p>
                    fps :
                    <span class="value">{logger_message.fps}</span>
                </p>
                <p>
                    q :
                    <span class="value">{logger_message.q}</span>
                </p>
                <p>
                    size :
                    <span class="value">{logger_message.size}</span>
                </p>
                <p>
                    time :
                    <span class="value">{logger_message.time}</span>
                </p>
                <p>
                    bitrate :
                    <span class="value">{logger_message.bitrate}</span>
                </p>
                <p>
                    dup :
                    <span class="value">{logger_message.dup}</span>
                </p>
                <p>
                    drop :
                    <span class="value">{logger_message.drop}</span>
                </p>
                <p>
                    speed : 
                    <span class="value">{logger_message.speed}</span>
                </p>
            </div>
            
            <div class="progress-log" bind:this={log_display}>
                {@html `<pre class="language-log"><code>${logger_html_string}</code></pre>`}
            </div>

        </Section>

        {#if is_modal_open}
            <Modal {current_presets} on:close={CloseModal}/>
        {/if}
	</div>

    <SvelteToast options={toast_options} />
</main>

<style>

	main{
		display: grid;
		justify-items: center;
		grid-template-rows: 25px auto;
		height: 100vh;
		background: var(--background);
		overflow: hidden;
	}

	.body{
        display: grid;
        place-items: center;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: calc(70% - 0.5em) calc(30% - 0.5em);
        gap: 1em;
        height: 100%;
        width: 100%;
        padding: 1em;
        overflow: auto;
	}

    .progress-details{
        border-right: 1px solid var(--foreground);
        color: var(--another-text);
        padding: 1em;
        overflow: auto;
        display: grid;
        grid-auto-flow: column;
        grid-template-rows: repeat(auto-fill, 30px);
        font-size: 0.9em;
    }

    .progress-log{
        overflow: auto;
        color: var(--another-text);
    }

    .value{
        color: var(--warning)
    }

    .child-window-toggle{
        position: absolute;
        right: 0;
    }

    .output-block{
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 10;
        background: #2b2c2ba6;
    }

</style>