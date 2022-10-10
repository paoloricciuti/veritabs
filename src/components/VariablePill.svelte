<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import CloseIcon from "./CloseIcon.svelte";
    const dispatch = createEventDispatcher();
    export let name: string;
</script>

<button
    on:click={() => {
        dispatch("delete");
    }}
    class="flex text-sm gap-3 items-center px-4 py-1 ring-1 ring-green-400 rounded-full text-green-400 font-bold"
>
    {name}
    <CloseIcon classes="text-green-400" />
</button>
