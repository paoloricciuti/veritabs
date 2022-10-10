<script lang="ts">
    import VeriTabs from "../components/VeriTabs.svelte";
    import VariablePill from "../components/VariablePill.svelte";
    import { SvelteToast } from "@zerodevx/svelte-toast";
    import { success, error, info } from "../toasts/toasts";
    import copy from "../assets/copy.svg";
    import solve from "../assets/solve.svg";
    import { onMount } from "svelte";
    import Credits from "../components/Credits.svelte";

    let variables = new Set<string>();
    let variable = "";
    let table: string[] = [];
    let selectedIndexes = new Set<number>();
    let ignoredIndexes = new Set<number>();
    let formula: string;

    let worker: Worker;

    onMount(() => {
        if (window.Worker) {
            worker = new Worker("minimizer.js");
            const handleMessage = ({
                data: { result, type },
            }: MessageEvent<{
                result: string;
                type: "result" | "advancing";
            }>) => {
                if (!type) {
                    error("errors were made...");
                    return;
                }
                if (type === "result") {
                    if (result === "0") {
                        formula = "false";
                        return;
                    }
                    if (result === "1") {
                        formula = "true";
                        return;
                    }
                    formula = result;
                }
            };
            const handleError = (e: ErrorEvent) => {
                error(e.message);
            };
            worker.addEventListener("message", handleMessage);
            worker.addEventListener("error", handleError);
            return () => {
                worker.removeEventListener("message", handleMessage);
                worker.removeEventListener("error", handleError);
            };
        }
    });

    $: {
        let length = 2 ** variables.size - 1;
        let maxLength = length.toString(2).length;
        table = Array.from({ length: length + 1 }, (_, i) => {
            return i.toString(2).padStart(maxLength, "0");
        });
        calculateFormula();
    }

    const handleSolve = () => {
        if (worker) {
            console.log("posting", variables, selectedIndexes, ignoredIndexes);
            worker.postMessage({
                variables: [...variables],
                toPush: [...selectedIndexes],
                toPushDc: [...ignoredIndexes],
            });
        }
    };

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
    class="lg:h-screen text-center font-mono text-slate-100 grid justify-center p-8 lg:grid-cols-[min-content,1fr]"
>
    <section>
        <section class="px-4 grid gap-4">
            <h1 class="text-6xl">
                <VeriTabs />
            </h1>
            <h2>
                Sometimes writing boolean expressions with a lot of variables
                can be a pain, <VeriTabs /> comes to the resque!
            </h2>
            <Credits />
            <form
                class="flex items-center justify-center px-4 gap-2 flex-col md:flex-row"
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
        </section>
        <section
            class="flex flex-wrap max-w-full gap-2 items-center justify-center empty:my-0 my-4 py-1"
        >
            {#each [...variables] as variableName (variableName)}
                <VariablePill
                    name={variableName}
                    on:delete={() => {
                        variables.delete(variableName);
                        variables = variables;
                        selectedIndexes.clear();
                        selectedIndexes = selectedIndexes;
                        ignoredIndexes.clear();
                        ignoredIndexes = ignoredIndexes;
                    }}
                />
            {/each}
        </section>
    </section>
    <section class="overflow-auto max-h-full">
        <section class="bg-slate-900 mb-4 p-2 max-w-full sticky top-0">
            <div class="flex flex-row justify-end">
                <p class="text-sm mr-auto">formula</p>
                <button
                    class="disabled:opacity-50"
                    disabled={variables.size === 0 || !worker}
                    on:click={handleSolve}
                >
                    <img src={solve} alt="simplify this expression" />
                </button>
                <button
                    on:click={async () => {
                        if (formula === DEFAULT_FORMULA) {
                            info("there's no formula to be seen.");
                            return;
                        }
                        try {
                            navigator.clipboard.writeText(formula);
                            success("copied!");
                        } catch (e) {
                            error("errors were made!");
                        }
                    }}
                >
                    <img src={copy} alt="copy the expression" />
                </button>
            </div>
            <code class="select-all">{formula}</code>
        </section>
        {#if table.length > 1}
            <section class="overflow-x-auto">
                <table class="table-fixed w-full">
                    <thead>
                        <tr>
                            {#each [...variables] as variable (variable)}
                                <th>{variable}</th>
                            {/each}
                            <th class="overflow-hidden overflow-ellipsis"
                                >result</th
                            >
                            <th class="overflow-hidden overflow-ellipsis"
                                >ignore</th
                            >
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
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIndexes.has(i)}
                                        on:change={(e) => {
                                            if (!e.currentTarget.checked) {
                                                selectedIndexes.delete(i);
                                                selectedIndexes =
                                                    selectedIndexes;
                                            } else {
                                                selectedIndexes.add(i);
                                                selectedIndexes =
                                                    selectedIndexes;
                                            }
                                            calculateFormula();
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={ignoredIndexes.has(i)}
                                        on:change={(e) => {
                                            if (!e.currentTarget.checked) {
                                                ignoredIndexes.delete(i);
                                                ignoredIndexes = ignoredIndexes;
                                            } else {
                                                ignoredIndexes.add(i);
                                                ignoredIndexes = ignoredIndexes;
                                            }
                                            calculateFormula();
                                        }}
                                    />
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>
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
