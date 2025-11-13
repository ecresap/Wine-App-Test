// Helper functions for Wine Buddy tasting persistence and export
(function() {
  const STORAGE_KEY = 'winebuddy_tastings';

  function getTastings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error reading tastings from localStorage', err);
      return [];
    }
  }

  function saveTastings(list) {
    try {
      const json = JSON.stringify(Array.isArray(list) ? list : []);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (err) {
      console.error('Error saving tastings to localStorage', err);
    }
  }

  function addTasting(tasting) {
    const list = getTastings();
    list.push(tasting);
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

  // Expose functions on global window object for ease of use
  window.getTastings = getTastings;
  window.saveTastings = saveTastings;
  window.addTasting = addTasting;
  window.exportTastings = exportTastings;
})();