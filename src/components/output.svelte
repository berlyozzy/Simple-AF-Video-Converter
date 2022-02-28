<script>
    import{ onMount, createEventDispatcher } from 'svelte';
    import { selected_preset, custom_save_path, custom_file_name } from 'stores/stores.js';
    import { CheckFileNameFormat, CheckPresetValues, CheckExtensionFormat } from 'lib/helpers.js';

    let isNameValid = false;
    let isPresetValid = true;
    let isExtensionValid = false;
    const dispatch = createEventDispatcher();

    let presets = []

    const OpenFolder = () => {

        const event = new CustomEvent('OpenFolder');
        window.dispatchEvent(event);

    }

    const SelectPreset = ({target : { textContent }}) => {
        $selected_preset = presets.find(e => e.name == textContent);
        CheckExtension();
    }

    const GetPresets = () => {
        const event = new CustomEvent('getPresets');
        window.dispatchEvent(event);
    }

    const NewPresets = () => {
        dispatch("new", { presets })
    }

    onMount(() => {

        GetPresets();

        window.addEventListener("newSavePath", ({detail: { path }}) => {

            if(path.length != 0){
                $custom_save_path = path[0].replaceAll(/(\\\\)/g,"\\");
            }
            
        })

        window.addEventListener("setPresets", ({detail: { data }}) => {

            presets = data

        })

    })

    const CheckName = () => {
        isNameValid = CheckFileNameFormat($custom_file_name);
        dispatch("name", { isNameValid })
    }

    const CheckExtension = () => {
        isExtensionValid = CheckExtensionFormat($selected_preset.extension)
        dispatch("extension", { isExtensionValid })
    }

</script>


<div class="buttons">
    {#if presets.length !== 0}

    {#each presets as { name } }
        <button class="button {$selected_preset.name == name ? "is-selected" : ""}" on:click={SelectPreset}>{name}</button>
    {/each}

    {/if}

    <button class="button" on:click={NewPresets}>+</button>
</div>

<hr>

<div class="field">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">File Name</label>
    <div class="control" style="display: grid; grid-template-columns: 80% 20%; gap: 0.5em">
      <input class="input {!isNameValid ? "is-not-valid" : ""}" bind:value={$custom_file_name} spellcheck="false" type="text" placeholder="file" on:input={CheckName}>
      {#if $selected_preset.name != "Custom"}
      <input class="input" type="text" bind:value={$selected_preset.extension} spellcheck="false" placeholder="mp4" readonly>
      {:else}
      <input class="input {!isExtensionValid ? "is-not-valid" : ""}" type="text" bind:value={$selected_preset.extension} spellcheck="false" placeholder="mp4" on:input={CheckExtension}>
      {/if}
    </div>
</div>

{#key $custom_save_path}
<div class="output-folder">
    <button class="button" on:click={OpenFolder}>Select Folder</button>
    <input class="input" type="text" placeholder="C:\Users\User\Folder" spellcheck="false" bind:value={$custom_save_path} readonly>
</div>
{/key}

<hr>

<div class="field advanced">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">Advanced</label>
    <div class="control">
      <textarea 
        class="textarea {!isPresetValid && $selected_preset.options != "" ? "is-not-valid" : ""}" 
        bind:value={$selected_preset.options} 
        spellcheck="false"
        placeholder="-i input [FFMPEG options] output" on:input={_ => isPresetValid = CheckPresetValues($selected_preset.options)}
    ></textarea>
    </div>
</div>

<style>

    .output-folder{
        display: grid;
        grid-template-columns: max-content auto;
        gap: 0.5em;
    }

    .output-folder .input{
        cursor: not-allowed;
    }

    .advanced{
        height: 100%;
        display: grid;
        grid-template-rows: max-content auto;
        overflow: auto;
    }

    .textarea{
        height: 100%;
    }

</style>