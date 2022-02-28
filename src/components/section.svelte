<script>
    export let style = "";
</script>

<div class="body-section content" style={style}>
    <slot></slot>
</div>

<style>
    .body-section{
        display: grid;
        height: 100%;
        width: 100%;
        border: 1px solid var(--foreground);
        padding: 1em;
    }

    .content:not(:last-child){
        margin: 0;
    }
</style>