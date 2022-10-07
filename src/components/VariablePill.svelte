<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import close from "../assets/close.svg";
    const dispatch = createEventDispatcher();
    export let name: string;
</script>

<button
    on:click={() => {
        dispatch("delete");
    }}
    class="flex gap-3 items-center px-4 py-1 ring-1 ring-green-400 rounded-full text-green-400 font-bold"
>
    {name}
    <img src={close} alt="delete this variable" />
</button>
