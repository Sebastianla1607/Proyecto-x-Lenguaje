function showPanel(name) {
  const panels = document.getElementsByClassName('panel');
  for (const p of panels) p.classList.add('hidden');
  const target = document.getElementById(name);
  if (target) target.classList.remove('hidden');

  const events = document.getElementsByClassName('events-panel');
  for (const e of events) e.classList.add('hidden');
  if (name === 'panel-todos') document.getElementById('events-panel-todos').classList.remove('hidden');
  if (name === 'panel-votantes') document.getElementById('events-panel-votantes').classList.remove('hidden');
  if (name === 'panel-miembros') document.getElementById('events-panel-miembros').classList.remove('hidden');

  const btns = document.getElementsByClassName('filter-btn');
  for (const b of btns) b.classList.remove('bg-primary','text-black','font-semibold');
  const btn = document.getElementById('btn-' + name);
  if (btn) btn.classList.add('bg-primary','text-black','font-semibold');
}

document.addEventListener('DOMContentLoaded', function () {
  showPanel('panel-todos');
  document.getElementById('btn-panel-todos').addEventListener('click', ()=> showPanel('panel-todos'));
  document.getElementById('btn-panel-votantes').addEventListener('click', ()=> showPanel('panel-votantes'));
  document.getElementById('btn-panel-miembros').addEventListener('click', ()=> showPanel('panel-miembros'));
});
