<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<div class="mx-auto max-w-4xl p-6 space-y-4">
  <h1 class="text-2xl font-semibold">Tasks</h1>

  {#if data.tasks.length === 0}
    <p class="text-sm text-zinc-500">No tasks yet.</p>
  {:else}
    <ul class="space-y-4">
      {#each data.tasks as t}
        <li class="rounded-xl border border-zinc-200 p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-zinc-600">
              {t.type} • <span class="uppercase">{t.status}</span>
            </div>

            <!-- quick status update form -->
            <form method="POST" use:enhance class="flex items-center gap-2" action="?/update">
              <input type="hidden" name="id" value={t.id} />
              <select name="status" class="rounded-md border px-2 py-1 text-sm">
                <option value="new" selected={t.status === 'new'}>new</option>
                <option value="in_progress" selected={t.status === 'in_progress'}>in_progress</option>
                <option value="completed" selected={t.status === 'completed'}>completed</option>
                <option value="parked" selected={t.status === 'parked'}>parked</option>
              </select>
              <button class="rounded-md border px-3 py-1 text-sm">Save</button>
            </form>
            
        </div>
        
        <div class="font-medium mt-1">{t.title}</div>
        <div class="text-xs text-zinc-500 mt-1">
            Insight: {t.insightId}
            {#if t.dueAt} • Due: {new Date(t.dueAt).toLocaleString()}{/if}
        </div>
        <form method="POST" action="?/delete" class="mt-2 flex justify-end">
            <input type="hidden" name="id" value={t.id} />
            <button class="rounded-md border px-3 py-1 text-sm text-red-600">Delete</button>
        </form>
    </li>
      {/each}
    </ul>
  {/if}
</div>
