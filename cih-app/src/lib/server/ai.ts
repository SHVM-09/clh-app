export function quickParse(text: string) {
  const t = text.toLowerCase();
  const themes: string[] = [];
  if (t.includes('data')) themes.push('data platform');
  if (t.includes('gen ai') || t.includes('ai')) themes.push('gen ai');

  const signal =
    /(want|plan|modernize|migrate|poC|poc)/.test(t) ? 'opportunity'
    : /(risk|issue|blocked|budget cut|competitor)/.test(t) ? 'risk' : undefined;

  const strength = /(approved|budget)/.test(t) ? 'strong' : 'med';
  const horizon =
    /2 weeks|two weeks|immediate|asap/.test(t) ? 'immediate'
    : /(q[1-4]|3-6|months|quarter)/.test(t) ? '3-6m' : undefined;

  return { themes, signal, strength, horizon, actions: [{ type: 'follow-up' }] };
}
