<script>
    import Menu from 'components/toolsbar.svelte';
    import { logger_html_string } from 'stores/stores.js';
    import { GetTimestamp } from 'lib/helpers.js';
    import { onMount } from 'svelte';
    import "prismjs/themes/prism-tomorrow.min.css";
    import Search from 'components/search.svelte';

    let showSearch = false;

    const DisplayLogs = ({detail : { message : { logger } }}) => {
        $logger_html_string = logger
    }

    onMount(() => {
        window.addEventListener("ChildContent", DisplayLogs );
        window.addEventListener("keydown", CheckShortcuts );
    })

    const CheckShortcuts = ({key, ctrlKey}) => {
        
        if(ctrlKey && (key.toUpperCase() == "F")){
            showSearch = true;
        }

    }

    const Find = ({detail : {string}}) => {
        const loggs = document.getElementById("content");
        const loggs_list = loggs.childNodes;

        loggs_list.forEach(node => {
            if(node.nodeType == 1 && node.classList.contains("highlight-element")){
                node.classList.remove("highlight-element");
            }
        })

        if(string == ""){
            return
        }

        for(const node of loggs_list){
            if(node.textContent.includes(string.trim())){
                if(node.nodeType == 1){
                    node.classList.add("highlight-element")
                }else if(node.nodeType == 3){
                    const span = document.createElement("span");
                    span.innerText = node.textContent;
                    span.classList.add("highlight-element")
                    loggs.replaceChild(span, node)
                }
            }
        }

    }

</script>

<main class="child-page">
    <Menu isChild={true} />
    <div class="progress-log">

        {#if showSearch}
        <Search on:search={Find} on:close={_ => showSearch = false}/>
        {/if}

        <p class="time">(Created: {GetTimestamp()})</p>
        {@html `<pre class="language-log"><code id="content">${$logger_html_string}</code></pre>`}

    </div>
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

    .time{
        font-size: 0.9em;
    }

	.progress-log{
        display: grid;
        position: relative;
        grid-template-rows: max-content auto;
        gap: 0.5em;
        height: 100%;
        width: 100%;
        padding: 1em;
        overflow: auto;
	}

    :global(.child-page pre[class*=language-]) {
        padding: 0 !important;
    }

    :global(.highlight-element){
        background: var(--tag-light);
        color: white !important;
    }
</style>