// Mobile.bg's image overlay is the status signal; its combined equipment
// entry "Капариран\\Продаден" cannot distinguish the two states.
// Auditing all 85 live FADI listings found a reliable reserved/kaparo marker,
// but no distinct sold marker. Sold remains supported by the UI/model only;
// do not emit it here until a separate production signal is verified.
function extractStatus($, root) {
  const overlays = root.find('img.kaparo').toArray();
  for (const element of overlays) {
    const image = $(element);
    const label = String(image.attr('alt') || '').trim().toLowerCase();
    const source = image.attr('src') || image.attr('data-src') || '';
    if (/^капариран(?:о|а)?$/.test(label) && /\/kaparirano\.svg(?:[?#]|$)/i.test(source)) return 'reserved';
  }
  return 'available';
}

module.exports = { extractStatus };
