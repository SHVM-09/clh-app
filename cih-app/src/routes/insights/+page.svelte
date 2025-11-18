<script lang="ts">
  let { data } = $props();
</script>

<h1 class="text-2xl font-bold">Insights</h1>
<p class="opacity-70 text-sm">Latest 50 (Slack + future sources)</p>

<div class="mt-4 space-y-3">
  {#if data.insights.length === 0}
    <div class="text-sm opacity-70">No insights yet.</div>
  {:else}
    {#each data.insights as i}
      <article class="rounded border p-3">
        <div class="text-xs opacity-60">
          {new Date(i.createdAt).toLocaleString()} · {i.source}
        </div>
        <div class="mt-1">{i.rawText}</div>
        {#if i.parsedJson}
          <pre class="mt-2 text-xs bg-black/5 p-2 rounded">{i.parsedJson}</pre>
        {/if}
        <!-- inside the {#each data.items as i} article header -->
        <div class="text-xs opacity-60">
        {new Date(i.createdAt).toLocaleString()} · {i.source}
        {#if i.clientId}
            · <a class="underline" href={`/accounts/${i.clientId}`}>client: {i.clientId}</a>
        {/if}
        </div>
        <form method="POST" action="?/update" class="mt-2 flex gap-2 items-center">
        <input type="hidden" name="id" value={i.id} />
        <label for="strength" class="text-xs">Strength</label>
        <select name="strength" class="border rounded px-2 py-1 text-sm">
          <option value="">(none)</option>
          <option value="weak" selected={i.strength==='weak'}>weak</option>
          <option value="med" selected={i.strength==='med'}>med</option>
          <option value="strong" selected={i.strength==='strong'}>strong</option>
        </select>

        <label for="horizon" class="text-xs">Horizon</label>
        <select name="horizon" class="border rounded px-2 py-1 text-sm">
          <option value="">(none)</option>
          <option value="immediate" selected={i.horizon==='immediate'}>immediate</option>
          <option value="3-6m" selected={i.horizon==='3-6m'}>3–6m</option>
          <option value=">12m" selected={i.horizon==='>12m'}>&gt;12m</option>
        </select>

        <button class="border rounded px-3 py-1 text-sm">Save</button>
      </form>

      <form method="POST" action="?/delete" class="mt-1">
        <input type="hidden" name="id" value={i.id} />
        <button class="rounded-md border px-3 py-1 text-sm text-red-600">Delete insight</button>
      </form>


      </article>
    {/each}
  {/if}
</div>
