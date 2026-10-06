// Wine Buddy tasting persistence with backward-compatible migration and recovery.
(function() {
  const STORAGE_KEY = 'winebuddy_tastings';
  const BACKUP_KEY = 'winebuddy_tastings_backup_v1';
  const LEGACY_KEYS = ['winebuddy_tastings_v2', 'winebuddy_data'];

  function safeParse(raw) {
    if (typeof raw !== 'string') return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
      console.error('Error parsing Wine Buddy data', err);
      return null;
    }
  }

  function readKey(key) {
    const raw = localStorage.getItem(key);
    return {
      exists: raw !== null,
      data: safeParse(raw)
    };
  }

  function normalizeGrapes(tasting) {
    if (Array.isArray(tasting.grapes) && tasting.grapes.length) {
      return tasting.grapes
        .map(g => {
          if (typeof g === 'string') return { name: g, percentage: null };
          if (!g || typeof g.name !== 'string' || !g.name.trim()) return null;
          const pct = g.percentage === '' || g.percentage === null || g.percentage === undefined
            ? null
            : Number(g.percentage);
          return {
            name: g.name.trim(),
            percentage: Number.isFinite(pct) ? pct : null
          };
        })
        .filter(Boolean);
    }
    if (typeof tasting.grape === 'string' && tasting.grape.trim()) {
      return [{ name: tasting.grape.trim(), percentage: null }];
    }
    return [];
  }

  function normalizeTasting(tasting) {
    const next = Object.assign({}, tasting || {});
    next.grapes = normalizeGrapes(next);

    // Keep the legacy grape field so older builds/exports still understand the record.
    if (!next.grape && next.grapes.length === 1) {
      next.grape = next.grapes[0].name;
    } else if (!next.grape && next.grapes.length > 1) {
      next.grape = 'Blend';
    }

    next.smell = Array.isArray(next.smell) ? next.smell : [];
    next.taste = Array.isArray(next.taste) ? next.taste : [];
    return next;
  }

  function normalizeList(list) {
    return Array.isArray(list) ? list.map(normalizeTasting) : [];
  }

  function getTastings() {
    try {
      const primary = readKey(STORAGE_KEY);
      if (primary.exists && primary.data !== null) {
        return normalizeList(primary.data);
      }

      // Recover automatically from the last known-good backup if the primary key
      // is missing or malformed after a deployment/update.
      const backup = readKey(BACKUP_KEY);
      if (backup.data !== null) {
        const recovered = normalizeList(backup.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
        return recovered;
      }

      // One-time recovery path for older experimental storage keys.
      for (const key of LEGACY_KEYS) {
        const legacy = readKey(key);
        if (legacy.data !== null && legacy.data.length) {
          const recovered = normalizeList(legacy.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
          localStorage.setItem(BACKUP_KEY, JSON.stringify(recovered));
          return recovered;
        }
      }
      return [];
    } catch (err) {
      console.error('Error reading tastings from localStorage', err);
      return [];
    }
  }

  function saveTastings(list) {
    try {
      const normalized = normalizeList(Array.isArray(list) ? list : []);

      // Preserve the previous valid state before every write. A code deployment
      // therefore cannot silently destroy the last known-good tasting collection.
      const current = readKey(STORAGE_KEY);
      if (current.data !== null) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(current.data));
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.error('Error saving tastings to localStorage', err);
    }
  }

  function addTasting(tasting) {
    const list = getTastings();
    list.push(normalizeTasting(tasting));
    saveTastings(list);
  }

  function exportTastings() {
    const list = getTastings();
    const json = JSON.stringify(list, null, 2);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'winebuddy-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting tastings', err);
    }
    return json;
  }

  window.getTastings = getTastings;
  window.saveTastings = saveTastings;
  window.addTasting = addTasting;
  window.exportTastings = exportTastings;
  window.normalizeWineBuddyTasting = normalizeTasting;
})();