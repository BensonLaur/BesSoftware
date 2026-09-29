(() => {
  const root = document.getElementById('bes-software');
  const svg = root.querySelector('.bes-map-svg');
  const button = root.querySelector('[data-map-switch]');
  const status = root.querySelector('[data-map-status]');
  let projectionIndex = 0;
  let land;

  function draw() {
    if (!land) return;
    const width = Math.max(180, svg.getBoundingClientRect().width);
    const height = 124;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const projection = (projectionIndex === 0 ? d3.geoEqualEarth() : d3.geoMercator())
      .fitExtent([[3, 3], [width - 3, height - 3]], { type: 'Sphere' });
    const path = d3.geoPath(projection);
    svg.querySelector('.bes-ocean').setAttribute('d', path({ type: 'Sphere' }));
    svg.querySelector('.bes-land').setAttribute('d', path(land));
    svg.querySelector('.bes-graticule').setAttribute('d', path(d3.geoGraticule10()));
    status.textContent = projectionIndex === 0 ? 'Equal Earth · 等积' : 'Mercator · 墨卡托';
    svg.setAttribute('aria-label', projectionIndex === 0 ? 'Equal Earth 等积投影下的世界地图' : 'Mercator 墨卡托投影下的世界地图，高纬度地区被放大');
  }

  button.addEventListener('click', () => { projectionIndex = 1 - projectionIndex; draw(); });
  new ResizeObserver(draw).observe(svg);
  // 相对路径同时适用于 GitHub 项目子路径与后续自定义域名。
  fetch('./assets/data/world-land.topo.json')
    .then(response => {
      if (!response.ok) throw new Error('地图资源加载失败：' + response.status);
      return response.json();
    })
    .then(world => {
      land = topojson.feature(world, world.objects.land);
      draw();
      button.disabled = false;
    })
    .catch(() => {
      status.textContent = '地图暂未加载，可进入作品探索';
      svg.setAttribute('aria-label', '地图暂未加载，请通过下方链接打开 BesMapLab');
    });
})();
