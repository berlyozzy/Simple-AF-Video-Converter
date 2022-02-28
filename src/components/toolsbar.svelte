<script>
    import Fa from 'svelte-fa';
	import { faWindowMinimize, faExpand, faTimes } from '@fortawesome/free-solid-svg-icons';

    export let isChild = false;

    const Click = (e) => {

        const event = new CustomEvent('custom_window', { detail: e } );
        window.dispatchEvent(event);

    }
    
</script>


<main>
    <div class="app-title">Simple AF Video Converter 🔥</div>
    <div class="app-controlls" style="{isChild ? "grid-template-columns: repeat(2, 37px);" : ""}">
        {#if !isChild}
        <span class="icon is-clickable" on:click={() => Click("minimize")}> <Fa icon={faWindowMinimize} size="xs" /></span>
        {/if}
        <span class="icon is-clickable" on:click={() => Click("size")}> <Fa icon={faExpand} size="xs" /></span>
        <span class="icon is-clickable" on:click={() => Click("close")}> <Fa icon={faTimes} size="xs" /></span>
    </div>
</main>


<style>
    main{
        height: 100%;
        width: 100%;
        -webkit-app-region: drag;
        position: relative;
        display: grid;
        place-items: center;
        z-index: 1000;
        background: var(--foreground);
        color: white !important;
    }

    .icon {
        -webkit-app-region: no-drag;
        height: 100% !important;
        width: 100%;
    }

    main .icon:hover{

        background: rgba(0,0,0,0.35) !important;
        color: white;

    }

    .app-title{
        font-size: 0.6em;
        opacity: 0.7;
        user-select: none;
        padding-top: 6px;
        height: 100% !important;
    }

    .app-controlls{
        display: grid;
        position: absolute;
        grid-template-columns: repeat(3, 37px);
        right: 0;
        height: 100%;
    }

</style>