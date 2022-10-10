<script lang="ts">
    type $$Props = svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["button"]>;
</script>

<button
    {...$$props}
    on:click
    class={`bg-zinc-900 rounded-full px-4 py-1 disabled:opacity-50 ${$$props.class}`}
>
    <slot />
</button>
