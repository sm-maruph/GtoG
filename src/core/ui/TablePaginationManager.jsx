import { useEffect } from 'react';

const PAGE_SIZE = 10;

export default function TablePaginationManager() {
  useEffect(() => {
    const states = new WeakMap();
    let frame;

    function render(table) {
      const body = table.tBodies[0];
      if (!body) return;
      const rows = Array.from(body.rows);
      let state = states.get(table);

      if (rows.length <= PAGE_SIZE) {
        rows.forEach((row) => { row.hidden = false; });
        state?.controls.remove();
        states.delete(table);
        return;
      }

      if (!state) {
        const controls = document.createElement('nav');
        controls.className = 'ui-pagination';
        controls.setAttribute('aria-label', 'Table pagination');
        controls.innerHTML = '<span class="ui-pagination-summary"></span><div><button type="button" data-page-action="previous">Previous</button><strong class="ui-pagination-page"></strong><button type="button" data-page-action="next">Next</button></div>';
        table.insertAdjacentElement('afterend', controls);
        state = { page: 1, controls };
        states.set(table, state);
        controls.addEventListener('click', (event) => {
          const action = event.target.closest('button')?.dataset.pageAction;
          const pageCount = Math.ceil(body.rows.length / PAGE_SIZE);
          if (action === 'previous') state.page = Math.max(1, state.page - 1);
          if (action === 'next') state.page = Math.min(pageCount, state.page + 1);
          update(table, state);
        });
      }

      update(table, state);
    }

    function update(table, state) {
      const rows = Array.from(table.tBodies[0]?.rows || []);
      const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
      state.page = Math.min(state.page, pageCount);
      const firstIndex = (state.page - 1) * PAGE_SIZE;
      rows.forEach((row, index) => { row.hidden = index < firstIndex || index >= firstIndex + PAGE_SIZE; });

      const summary = state.controls.querySelector('.ui-pagination-summary');
      const pageLabel = state.controls.querySelector('.ui-pagination-page');
      const previous = state.controls.querySelector('[data-page-action="previous"]');
      const next = state.controls.querySelector('[data-page-action="next"]');
      const summaryText = `Showing ${firstIndex + 1}–${Math.min(firstIndex + PAGE_SIZE, rows.length)} of ${rows.length}`;
      const pageText = `Page ${state.page} of ${pageCount}`;
      if (summary.textContent !== summaryText) summary.textContent = summaryText;
      if (pageLabel.textContent !== pageText) pageLabel.textContent = pageText;
      previous.disabled = state.page === 1;
      next.disabled = state.page === pageCount;
    }

    function scan() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.querySelectorAll('table').forEach(render));
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    scan();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.querySelectorAll('.ui-pagination').forEach((control) => control.remove());
      document.querySelectorAll('tbody tr[hidden]').forEach((row) => { row.hidden = false; });
    };
  }, []);

  return null;
}
