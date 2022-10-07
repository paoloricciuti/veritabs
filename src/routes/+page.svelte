<script lang="ts">
    import VeriTabs from "../components/VeriTabs.svelte";
    import VariablePill from "../components/VariablePill.svelte";
    import { SvelteToast } from "@zerodevx/svelte-toast";
    import { success, error, info } from "../toasts/toasts";
    import copy from "../assets/copy.svg";
    import solve from "../assets/solve.svg";

    let variables = new Set<string>(["a", "b"]);
    let variable = "";
    let table: string[] = [];
    let selectedIndexes = new Set<number>();
    let formula: string = "no formula yet";

    $: {
        let length = 2 ** variables.size - 1;
        let maxLength = length.toString(2).length;
        table = Array.from({ length: length + 1 }, (_, i) => {
            return i.toString(2).padStart(maxLength, "0");
        });
        calculateFormula();
    }

    const DEFAULT_FORMULA = "no formula yet";

    const calculateFormula = () => {
        formula =
            [...selectedIndexes]
                .map((index) => {
                    return [...(table[index] ?? [])]
                        .map((variableValue, variableIndex) => {
                            return `${variableValue === "1" ? "" : "!"}${
                                [...variables][variableIndex]
                            }`;
                        })
                        .join(" && ");
                })
                .join(" || ") || DEFAULT_FORMULA;
    };
</script>

<svelte-toast-wrapper>
    <SvelteToast />
</svelte-toast-wrapper>
<main
    class="text-center font-mono text-slate-100 max-w-3xl m-auto grid justify-center"
>
    <section class="bg-zinc-800 sticky top-0 p-4">
        <h1 class="text-6xl mb-4">
            <VeriTabs />
        </h1>
        <h2>
            Sometimes writing boolean expressions with a lot of variables can be
            a pain, <VeriTabs /> comes to the resque!
        </h2>
        <form
            class="flex items-center justify-center p-4 gap-2 flex-col md:flex-row"
            on:submit|preventDefault={() => {
                variables = variables.add(variable);
                variable = "";
            }}
        >
            <label for="varname">variable name:</label>
            <input
                id="varname"
                class="bg-zinc-600 px-2 py-1 rounded-full"
                bind:value={variable}
            />
            <button
                disabled={!variable}
                class="bg-zinc-900 rounded-full px-4 py-1 disabled:opacity-50"
            >
                Add
            </button>
        </form>
        <section class="bg-slate-900 mb-4 p-2 max-w-full">
            <div class="flex flex-row justify-end">
                <button>
                    <img src={solve} alt="simplify this expression" />
                </button>
                <button
                    on:click={async () => {
                        if (formula === DEFAULT_FORMULA) {
                            info("There's no formula to be seen.");
                            return;
                        }
                        try {
                            navigator.clipboard.writeText(formula);
                            success("Copied!");
                        } catch (e) {
                            error("Errors were made!");
                        }
                    }}
                >
                    <img src={copy} alt="copy the expression" />
                </button>
            </div>
            <code class="select-all">{formula}</code>
        </section>
    </section>
    <section
        class="flex flex-wrap max-w-full gap-2 items-center justify-center mb-4 py-1"
    >
        {#each [...variables] as variableName (variableName)}
            <VariablePill
                name={variableName}
                on:delete={() => {
                    variables.delete(variableName);
                    variables = variables;
                    selectedIndexes.clear();
                    selectedIndexes = selectedIndexes;
                }}
            />
        {/each}
    </section>
    <section class="overflow-x-auto">
        {#if table.length > 1}
            <table class="table-fixed w-full">
                <thead>
                    <tr>
                        {#each [...variables] as variable (variable)}
                            <th>{variable}</th>
                        {/each}
                        <th>result</th>
                    </tr>
                </thead>
                <tbody>
                    {#each table as row, i}
                        <tr>
                            {#each [...row] as result}
                                <td
                                    class={result === "1"
                                        ? "text-green-400"
                                        : "text-red-500"}>{result}</td
                                >
                            {/each}
                            <td
                                ><input
                                    type="checkbox"
                                    checked={selectedIndexes.has(i)}
                                    on:change={(e) => {
                                        if (!e.currentTarget.checked) {
                                            selectedIndexes.delete(i);
                                            selectedIndexes = selectedIndexes;
                                        } else {
                                            selectedIndexes.add(i);
                                            selectedIndexes = selectedIndexes;
                                        }
                                        calculateFormula();
                                    }}
                                />
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p>Add a variable to see the truth table.</p>
        {/if}
    </section>
</main>

<style>
    svelte-toast-wrapper {
        display: contents;
        font-family: "Fira Mono", monospace;
        --toastContainerTop: auto;
        --toastContainerBottom: 1.5rem;
    }
</style>
