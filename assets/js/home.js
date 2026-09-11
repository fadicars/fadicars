(async () => {
  const core = window.FadiCore;
  const cars = await core.getCatalogue();
  document.querySelector("#homeCarCount").textContent = cars.length;

  const latest = [...cars]
    .sort((a,b) => (b.year || 0) - (a.year || 0) || (b.price || 0) - (a.price || 0))
    .slice(0, 8);

  const grid = document.querySelector("#latestCars");
  grid.innerHTML = latest.map(core.vehicleCard).join("");
  core.activateImageFallbacks(grid);

  document.querySelector("#homeSearchForm").addEventListener("submit", event => {
    event.preventDefault();
    const query = document.querySelector("#homeSearchInput").value.trim();
    location.href = `/cars?q=${encodeURIComponent(query)}`;
  });
})();
