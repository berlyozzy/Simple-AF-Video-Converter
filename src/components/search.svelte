<script>
    import { createEventDispatcher } from 'svelte';
    import Fa from 'svelte-fa';
    import { faTimes } from '@fortawesome/free-solid-svg-icons'

    const dispatch = createEventDispatcher();
    let text = "";

    const Find = () => {
        dispatch("search", { string : text })
    }

    const Close = () => {
        dispatch("close");
    }

</script>

<div class="search-window">
    <span class="icon is-clickable" style="position: absolute; right: 0;" on:click={Close}>
        <Fa icon={faTimes} />
    </span>
    <input class="input" type="text" spellcheck="false" placeholder="Keywords" bind:value={text} on:change={Find} style="margin-top: 0.5em">
    <button class="button" on:click={Find}>Search</button>
</div>

<style>
    .search-window{
        width: max-content;
        height: max-content;
        position: absolute;
        display: grid;
        gap: 0.5em;
        padding: 1em;
        right: 4vw;
        top: 4vh;
        background: var(--background);
        border: solid 1px var(--foreground);
    }
</style>