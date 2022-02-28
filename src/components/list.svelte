<script>
    import Fa from 'svelte-fa';
    import { selected_preset, custom_save_path, custom_file_name } from 'stores/stores.js';
    import { GetElapsedTime } from 'lib/helpers.js';
    import { faCheck, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { toast } from '@zerodevx/svelte-toast';

    const dispatch = createEventDispatcher();
    export let files = [];

    let files_to_render = files.length;
    let isLoading = false;
    let isCompleted = false;
    let timer = 0;
    let timeout; 

    const timer_interval = 100; // ms
    let original_time = 0;

    function step() {
        timer = Date.now() - original_time; 
        timeout = setTimeout(step, timer_interval);
    }

    const Convert = async () => {

        isLoading = true;

        const stripped_files = files.filter(({isIncluded}) => isIncluded).map(({file : { path, name }}) => {return { path, name }});
        const options_pattern = /([a-zA-Z0-9-:=]+)/g;
        let preset = Object.assign({}, $selected_preset);

        if(preset.options != ""){
            preset.options = preset.options.trim().match(options_pattern).map(e => e.trim())
        }

        const args = {
            files : stripped_files,
            preset : preset,
            path : $custom_save_path == '' ? "C:\\" : $custom_save_path,
            name : $custom_file_name.trim()
        }

        dispatch("convert", { args })

        original_time = Date.now() + timer_interval;
        timeout =  setTimeout(step, timer_interval);
    }

    const IncludeExclude = (id) => {

        if(isCompleted || isLoading){
            return false
        }

        files[id].isIncluded = !files[id].isIncluded
        files_to_render = files.filter(({isIncluded}) => isIncluded).length
    }

    const Cancel = () => {

        if(isLoading){
            return
        }else{
            dispatch("cancel");
        }
       
    }

    const ConversionCompleted = ({detail: { result }}) => {
        if(result){
            clearTimeout(timeout);
            isLoading = false;
            isCompleted = true;
        }

        for(const {status, error} of result){

            if(!status){
                toast.push(error.message);
            }

        }

        dispatch("completed");
    }

    const ConversionCancelled = () => {
        clearTimeout(timeout);
        timer = 0;
        isLoading = false;
        isCompleted = false;
    }

    onMount(() => {

        window.addEventListener("convert:Completed", ConversionCompleted)
        window.addEventListener("convert:Cancel:Not-Started", ConversionCancelled)

    })

    onDestroy(() => {

        window.removeEventListener("convert:Completed", ConversionCompleted);
        window.removeEventListener("convert:Cancel:Not-Started", ConversionCancelled);

    })

</script>

<div class="file-list">
    <div class="file-list-contents">
        {#each files as { thumb, name, type }, i }

        {@const split_type = type.split("/")}
        <div class="file-record is-clickable" style={ !files[i].isIncluded ? "background: var(--warning-light)" : ""} on:click={_ => IncludeExclude(i)}>
            
            <!-- https://via.placeholder.com/242423/bbbbbb/1920x1080/eee?text=Loading... -->
            <img src={thumb} style="height:80px; aspect-ratio: 16 / 9" alt={name}>

            <p>{i+1}. [<span style="color: var(--another-text)">{name}</span>] <span style="color: var(--tag)">{split_type[0]}</span>/<span style="color: var(--folder)">{split_type[1]}</span> </p> 

            {#if !isCompleted}

                {#if files[i].isIncluded}
                <span class="icon has-text-primary is-unselectable">
                    <Fa icon={faCheck} />
                </span>
                {:else}
                <span class="icon has-text-danger is-unselectable">
                    <Fa icon={faTimes} />
                </span>
                {/if}

            {:else}

                {#if files[i].isIncluded}
                <span class="icon has-text-primary is-unselectable">
                    <Fa icon={faSave} />
                </span>
                {:else}
                <span class="icon has-text-danger is-unselectable">
                    <Fa icon={faTimes} />
                </span>
                {/if}

            {/if}


        </div>
            
        {/each}
    </div>
    <div class="file-list-controlls">
        {#if isCompleted}
            <button class="button" on:click={Cancel}>Back</button>
        {:else if isLoading}
            <button class="button" disabled>Cancel</button>
        {:else}
            <button class="button" on:click={Cancel}>Cancel</button>
        {/if}
        

        {#if $selected_preset.name == "" || files_to_render == 0}
            <button class="button danger-hover" disabled>Convert</button>
        {:else if isLoading}
            <button class="button danger-hover is-loading" disabled>Convert</button>
        {:else}
            {#if isCompleted}
            <button class="button is-completed" disabled>Completed</button>
            {:else}
            <button class="button danger-hover" on:click={Convert}>Convert</button>
            {/if}
        {/if}

        {#if isLoading || isCompleted}
        <span class="elapsed-time">
            
            <p>Render Time</p>
            <p>{GetElapsedTime(timer)}</p>

        </span>
        {/if}

    </div>
</div>


<style>
    .file-list{
        height: 100%;
        width: 100%;
        display: grid;
        gap: 0.5em;
        grid-template-rows: calc(90% - 0.5em) 10%;
    }

    .file-list-contents{
        background: var(--eerie-black);
        overflow: auto;
    }

    .file-list-controlls{
        display: grid;
        grid-template-columns: repeat(2, max-content) auto;
        gap: 0.5em;
    }

    .file-record{
        color: var(--text);
        display: grid;
        grid-template-columns: max-content auto max-content;
        padding: 0.5em;
        align-items: center;
        gap: 1em;
    }

    .file-record p{
        font-size: 0.9em;
    }

    .file-record:hover{
        background: var(--highlight2);
    }

    .elapsed-time{
        display: inline-grid;
        place-items: center;
        height: 2.5rem;
        font-size: 0.8em;
        place-self: end;
        justify-items: end;
    }
</style>