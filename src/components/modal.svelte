<script>
    import { createEventDispatcher } from 'svelte';
    import { CheckPresetValues, CheckExtensionFormat, CheckPresetNameFormat } from 'lib/helpers.js';

    const dispatch = createEventDispatcher(); 
    export let current_presets = [];

    let name = "";
    let options = "";
    let extension = "";
    let isNameValid = false;
    let isPresetValid = true;
    let isExtensionValid = false;

    const UpdatePresets = () => {

        current_presets.push({
            "name": name.trim(),
            "options": options.trim(),
            "extension": extension.trim()
        })

        const event = new CustomEvent('updatePresets', { detail : { current_presets }});
        window.dispatchEvent(event);

    }

    const CheckExtension = () => {
        isExtensionValid = CheckExtensionFormat(extension)
    }

    const CheckName = () => {
        isNameValid = CheckPresetNameFormat(name)
    }

    const CheckOptions = () => {

        if(options == ""){
            isPresetValid = true
        }else{
            isPresetValid = CheckPresetValues(options)
        }
    }

    const Close = () => {
        dispatch("close");
    }

</script>


<div class="modal is-active">
    <div class="modal-background" on:click={Close}></div>
    <div class="modal-card">
      <section class="modal-card-body">
            <div class="field">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="label">Name</label>
                <div class="control">
                    <input class="input {!isNameValid ? "is-not-valid" : ""}" type="text" placeholder="Custom Preset" bind:value={name} on:input={CheckName}>
                </div>
            </div>

            <div class="field">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="label">Options</label>
                <div class="control">
                    <textarea 
                    class="textarea {!isPresetValid ? "is-not-valid" : ""}" 
                    bind:value={options} 
                    spellcheck="false"
                    placeholder="-i input [FFMPEG options] output" on:input={CheckOptions}
                    ></textarea>
                </div>
            </div>

            <div class="field">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="label">Extension</label>
                <div class="control">
                    <input class="input {!isExtensionValid ? "is-not-valid" : ""}" type="text" placeholder="MP4" bind:value={extension} on:input={CheckExtension}>
                </div>
            </div>
  
            <div class="field is-grouped">
                <div class="control">

                    {#if isExtensionValid && isPresetValid && isNameValid}
                    <button class="button" on:click={UpdatePresets}>Save</button>
                    {:else}
                    <button class="button" disabled >Save</button>
                    {/if}

                    <button class="button is-danger" on:click={Close}>Close</button>

                </div>
            </div>
      </section>
    </div>
</div>

<style>

    .modal-card-body{
        background: var(--background);
        border: 1px solid var(--foreground);
    }

    .label, .input{
        color: var(--darkmode_text);
        box-shadow: none;
    }
    
</style>
