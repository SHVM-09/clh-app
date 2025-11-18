<script lang="ts"> export let data; </script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
  <h1 class="text-2xl font-semibold">{data.client?.name}</h1>

  <section>
    <h2 class="text-lg font-medium">Insights</h2>
    {#each data.insights as i}
      <div class="mt-2 rounded border p-3">
        <div class="text-sm text-zinc-500">{i.createdAt && new Date(i.createdAt).toLocaleString()}</div>
        <div class="mt-1">{i.rawText}</div>
        <div class="text-xs text-zinc-500 mt-1">strength: {i.strength || '-'} • horizon: {i.horizon || '-'}</div>
      </div>
    {/each}
    {#if !data.insights?.length}<p class="text-sm text-zinc-500">No insights yet.</p>{/if}
  </section>

  <section>
    <h2 class="text-lg font-medium">Tasks</h2>
    {#each data.tasks as t}
      <div class="mt-2 rounded border p-3">
        <div class="text-sm">{t.title}</div>
        <div class="text-xs text-zinc-500">type: {t.type} • status: {t.status}</div>
      </div>
    {/each}
    {#if !data.tasks?.length}<p class="text-sm text-zinc-500">No tasks yet.</p>{/if}
  </section>
</div>
