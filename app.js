(() => {
  const root = document.getElementById('bes-software');
  window.lucide?.createIcons({ attrs: { width: 16, height: 16 } });
  const select = (query) => root.querySelector(query);
  let lyricIndex = 0;
  let lyricStart = 0;
  let dancing = false;
  const lines = Array.from(root.querySelectorAll('.bes-lyric-lines > div'));
  const markButton = select('[data-mark]');
  const distance = select('#bes-distance');
  const paymentImages = { wechat: './assets/support/wechat.png', alipay: './assets/support/alipay.png' };
  const plantArt = select('.bes-plant-art');
  const treeCanvas = select('.bes-tree-canvas');
  const treeContext = treeCanvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportButton = select('[data-open-support]');
  const supportPanel = select('#bes-support-panel');
  let growthDelay;
  let growthFrame;
  let growthProgress = 0;
  let growthTarget = 0;
  let treeColors = {};
  let paymentMethod = 'wechat';
  const paymentMethods = {
    wechat: { name: '微信', payee: 'Benson(**城)', width: 1266, height: 1749 },
    alipay: { name: '支付宝', payee: 'Bes软件', width: 1080, height: 1680 }
  };

  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const lerp = (start, end, progress) => start + (end - start) * progress;

  function readTreeColors() {
    for (const name of ['outline', 'leaf', 'light', 'trunk', 'soil']) {
      treeColors[name] = getComputedStyle(select('[data-tree-color="' + name + '"]')).color;
    }
    drawTree();
  }
  function mixTreeColors(start, end, progress) {
    const a = start.match(/[\d.]+/g).map(Number);
    const b = end.match(/[\d.]+/g).map(Number);
    return 'rgb(' + a.slice(0, 3).map((value, index) => Math.round(lerp(value, b[index], progress))).join(',') + ')';
  }
  function ellipse(x, y, radiusX, radiusY, rotation, color) {
    if (radiusX <= 0 || radiusY <= 0) return;
    treeContext.beginPath();
    treeContext.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    treeContext.fillStyle = color;
    treeContext.fill();
  }
  function seedLeaf(x, y, length, width, angle, progress) {
    treeContext.save();
    treeContext.translate(x, y);
    treeContext.rotate(angle);
    treeContext.beginPath();
    treeContext.moveTo(0, 0);
    treeContext.bezierCurveTo(length * .3, -width, length * .9, -width, length, 0);
    treeContext.bezierCurveTo(length * .85, width, length * .25, width, 0, 0);
    treeContext.fillStyle = mixTreeColors(treeColors.light, treeColors.leaf, progress);
    treeContext.fill();
    treeContext.strokeStyle = treeColors.outline;
    treeContext.lineWidth = 2.5;
    treeContext.stroke();
    treeContext.restore();
  }
  function drawTree() {
    if (!treeColors.outline) return;
    const scale = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.round(treeCanvas.clientWidth * scale);
    const height = Math.round(treeCanvas.clientHeight * scale);
    if (treeCanvas.width !== width || treeCanvas.height !== height) {
      treeCanvas.width = width;
      treeCanvas.height = height;
    }
    treeContext.setTransform(width / 160, 0, 0, height / 176, 0, 0);
    treeContext.clearRect(0, 0, 160, 176);
    const growth = ease(growthProgress);
    const trunkHeight = lerp(33, 104, growth);
    const trunkTop = 148 - trunkHeight;
    const bark = mixTreeColors(treeColors.outline, treeColors.trunk, ease((growth - .12) / .65));
    ellipse(80, 151, lerp(30, 44, growth), 3, 0, treeColors.soil);

    // 枝叶共用一个生长进度，收起时才能沿原路径回缩。
    const crowns = [
      { x: 33, y: 77, rx: 20, ry: 20, branch: .51, at: .18, color: 'outline' },
      { x: 124, y: 78, rx: 22, ry: 23, branch: .52, at: .24, color: 'outline' },
      { x: 52, y: 53, rx: 26, ry: 25, branch: .70, at: .30, color: 'leaf' },
      { x: 107, y: 48, rx: 25, ry: 26, branch: .72, at: .36, color: 'leaf' },
      { x: 78, y: 30, rx: 25, ry: 23, branch: .94, at: .42, color: 'leaf' },
      { x: 79, y: 66, rx: 31, ry: 28, branch: .65, at: .47, color: 'leaf' }
    ];
    for (const crown of crowns) {
      const branchGrowth = ease((growth - crown.at) / (1 - crown.at));
      const originY = 148 - trunkHeight * crown.branch;
      const tipX = lerp(80, crown.x, branchGrowth);
      const tipY = lerp(originY, crown.y, branchGrowth);
      treeContext.beginPath();
      treeContext.moveTo(80, originY);
      treeContext.quadraticCurveTo(lerp(80, tipX, .75), originY - 4, tipX, tipY);
      treeContext.strokeStyle = bark;
      treeContext.lineWidth = lerp(1, 4, branchGrowth);
      treeContext.lineCap = 'round';
      treeContext.stroke();
      const leafGrowth = ease((branchGrowth - .12) / .88);
      ellipse(tipX, tipY, crown.rx * leafGrowth, crown.ry * leafGrowth, (crown.x < 80 ? -.18 : .16), treeColors[crown.color]);
    }
    treeContext.beginPath();
    treeContext.moveTo(80, 148);
    treeContext.bezierCurveTo(81, 148 - trunkHeight * .35, 77, 148 - trunkHeight * .76, 80, trunkTop);
    treeContext.strokeStyle = bark;
    treeContext.lineWidth = lerp(3, 8, growth);
    treeContext.lineCap = 'round';
    treeContext.stroke();
    // 初生叶始终附着于树干，避免在幼苗与树冠之间切换两张图。
    seedLeaf(80, 148 - trunkHeight * .43, lerp(27, 34, growth), lerp(10, 13, growth), -2.6, growth);
    seedLeaf(79, trunkTop + 3, lerp(26, 33, growth), lerp(10, 13, growth), -.76, growth);
    const canopyFinish = ease((growth - .68) / .32);
    ellipse(71, 43, 23 * canopyFinish, 24 * canopyFinish, -.2, treeColors.leaf);
    ellipse(90, 64, 25 * canopyFinish, 25 * canopyFinish, .2, treeColors.leaf);
    for (const patch of [[62, 29, 11, 8], [44, 51, 10, 7], [102, 38, 10, 8], [118, 69, 8, 7], [73, 64, 11, 8]]) {
      ellipse(patch[0], patch[1], patch[2] * canopyFinish, patch[3] * canopyFinish, -.4, treeColors.light);
    }
    plantArt.dataset.growth = growthProgress.toFixed(3);
  }
  function setGrowthTarget(target) {
    cancelAnimationFrame(growthFrame);
    growthTarget = target;
    if (reducedMotion.matches) {
      growthProgress = target;
      drawTree();
      plantArt.setAttribute('aria-label', target ? '枝繁叶茂的大树' : '等待雨水的小芽');
      return;
    }
    let lastFrame;
    plantArt.setAttribute('aria-label', target ? '小芽正在长成大树' : '大树正在变回小芽');
    function advance(time) {
      if (lastFrame !== undefined) {
        const step = Math.min(80, time - lastFrame) / (growthTarget ? 1600 : 1300);
        growthProgress = growthTarget ? Math.min(growthTarget, growthProgress + step) : Math.max(growthTarget, growthProgress - step);
      }
      lastFrame = time;
      drawTree();
      if (growthProgress !== growthTarget) growthFrame = requestAnimationFrame(advance);
      else plantArt.setAttribute('aria-label', growthTarget ? '枝繁叶茂的大树' : '等待雨水的小芽');
    }
    growthFrame = requestAnimationFrame(advance);
  }
  function animateSupportTree(open) {
    clearTimeout(growthDelay);
    cancelAnimationFrame(growthFrame);
    plantArt.classList.remove('is-watering');
    if (!open || reducedMotion.matches) {
      setGrowthTarget(open ? 1 : 0);
      return;
    }
    // 取消上一次落雨与生长任务，快速反向点击时保留当前形态。
    void plantArt.offsetWidth;
    plantArt.classList.add('is-watering');
    growthDelay = setTimeout(() => {
      plantArt.classList.remove('is-watering');
      setGrowthTarget(1);
    }, 650);
  }
  readTreeColors();
  new ResizeObserver(drawTree).observe(treeCanvas);
  new MutationObserver(readTreeColors).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTreeColors);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      clearTimeout(growthDelay);
      plantArt.classList.remove('is-watering');
      setGrowthTarget(supportPanel.hidden ? 0 : 1);
    }
  });
  function renderPayment(method) {
    if (!paymentMethods[method]) return;
    paymentMethod = method;
    const selected = paymentMethods[method];
    const picture = select('[data-payment-image]');
    picture.src = paymentImages[method];
    picture.width = selected.width;
    picture.height = selected.height;
    picture.alt = selected.name + '收款原图，收款主体 ' + selected.payee;
    select('[data-payment-payee]').textContent = selected.name + ' · ' + selected.payee;
    select('[data-payment-original]').href = paymentImages[method];
    root.querySelectorAll('[data-payment-method]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paymentMethod === method)));
  }
  function setSupportOpen(open, returnFocus = false) {
    supportPanel.hidden = !open;
    supportButton.setAttribute('aria-expanded', String(open));
    select('[data-support-action]').textContent = open ? '收起打赏' : '自愿打赏';
    animateSupportTree(open);
    if (open) {
      renderPayment(paymentMethod);
    } else if (returnFocus) {
      supportButton.focus({ preventScroll: true });
    }
  }
  supportButton.addEventListener('click', () => setSupportOpen(supportPanel.hidden));
  select('[data-close-support]').addEventListener('click', () => setSupportOpen(false, true));
  root.querySelectorAll('[data-payment-method]').forEach(button => button.addEventListener('click', () => renderPayment(button.dataset.paymentMethod)));
  select('.bes-support').addEventListener('keydown', event => {
    if (event.key === 'Escape' && !supportPanel.hidden) {
      event.preventDefault();
      setSupportOpen(false, true);
    }
  });

  function renderFuel() {
    select('[data-distance]').textContent = distance.value;
    select('[data-cost]').textContent = (Number(distance.value) * 7 / 100 * 7.5).toFixed(2);
  }
  renderFuel();
  markButton.addEventListener('click', () => {
    if (lyricIndex === lines.length) {
      lyricIndex = 0;
      root.querySelectorAll('[data-stamp]').forEach((stamp) => { stamp.textContent = '[待标记]'; });
      markButton.lastChild.textContent = ' 标记这一句';
      lines.forEach((line, index) => line.classList.toggle('is-current', index === 0));
      select('[data-lyric-status]').textContent = '从第一句开始';
      return;
    }
    if (lyricIndex === 0) lyricStart = performance.now();
    const hundredths = Math.round((performance.now() - lyricStart) / 10);
    const minutes = String(Math.floor(hundredths / 6000)).padStart(2, '0');
    const seconds = String(Math.floor(hundredths / 100) % 60).padStart(2, '0');
    const fraction = String(hundredths % 100).padStart(2, '0');
    select('[data-stamp="' + lyricIndex + '"]').textContent = '[' + minutes + ':' + seconds + '.' + fraction + ']';
    lyricIndex += 1;
    lines.forEach((line, index) => line.classList.toggle('is-current', index === lyricIndex));
    select('[data-lyric-status]').textContent = lyricIndex === 3 ? '三句都记录好了' : '已标记 ' + lyricIndex + ' / 3 句';
    if (lyricIndex === 3) markButton.lastChild.textContent = ' 再来一次';
  });
  select('[data-desktop-play]').addEventListener('click', () => {
    if (dancing) return;
    dancing = true;
    select('.bes-character').classList.add('is-playing');
    select('[data-bes-speech]').textContent = '好啦，活动一下！';
    select('[data-desktop-status]').textContent = '图标出来伸了个懒腰';
    setTimeout(() => {
      select('.bes-character').classList.remove('is-playing');
      select('[data-bes-speech]').textContent = '桌面也可以有点小脾气。';
      dancing = false;
    }, 1300);
  });
  distance.addEventListener('input', renderFuel);
})();
