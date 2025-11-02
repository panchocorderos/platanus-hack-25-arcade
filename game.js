// Hacker Survivors - Cyberpunk Survivor Game
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

// Game state
let p, enemies = [], projs = [], xpCrys = [], goldDrops = [], wpns = [], state, lvl, xp, hp, maxHp, spd, spawnT, lastFire, keys, g, sceneRef;
let gameTime, startTime, uiTexts, upgradeCards, xpGain, pickupRange, allDmgMult, particles = [], kills, gold;
const MENU = 0, PLAYING = 1, LEVELUP = 2, GAMEOVER = 3, SHOP = 4;

function preload() {
  // Crear sprites de pixel art programáticamente
  this.load.image('hacker', createHackerSprite());
  this.load.image('bug', createBugSprite(0xff0000));
  this.load.image('virus', createBugSprite(0xff00ff));
  this.load.image('trojan', createBugSprite(0x0000ff));
}

function createHackerSprite() {
  const c = document.createElement('canvas');
  c.width = 32; 
  c.height = 32;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  // Paleta de colores basada en tu imagen
  const hoodie = '#6b8ba8';      // Azul-gris principal
  const hoodieDark = '#4a6382';  // Sombras del hoodie
  const hoodieLight = '#8ba3bb'; // Luces del hoodie
  const face = '#1a1a3d';        // Cara oscura/void
  const eyes = '#ff3355';        // Ojos rojos brillantes
  const outline = '#2d3e56';     // Contorno más oscuro
  
  // CAPUCHA (hood)
  // Parte superior redondeada
  ctx.fillStyle = hoodie;
  ctx.fillRect(10, 4, 12, 3);    // Top
  ctx.fillRect(8, 7, 16, 3);     // Medio-alto
  ctx.fillRect(7, 10, 18, 4);    // Medio
  
  // Sombras de la capucha
  ctx.fillStyle = hoodieDark;
  ctx.fillRect(8, 4, 2, 3);      // Sombra izq superior
  ctx.fillRect(22, 4, 2, 3);     // Sombra der superior
  ctx.fillRect(7, 10, 2, 4);     // Sombra izq lateral
  ctx.fillRect(23, 10, 2, 4);    // Sombra der lateral
  
  // Borde superior de la capucha
  ctx.fillStyle = outline;
  ctx.fillRect(10, 3, 12, 1);    // Línea superior
  
  // CARA OSCURA (void face)
  ctx.fillStyle = face;
  ctx.fillRect(10, 8, 12, 9);    // Área de la cara
  
  // OJOS ROJOS BRILLANTES
  ctx.fillStyle = eyes;
  ctx.fillRect(12, 10, 3, 3);    // Ojo izquierdo
  ctx.fillRect(19, 10, 3, 3);    // Ojo derecho
  
  // Brillo en los ojos (opcional, más intenso)
  ctx.fillStyle = '#ff6677';
  ctx.fillRect(13, 10, 1, 1);    // Brillo ojo izq
  ctx.fillRect(20, 10, 1, 1);    // Brillo ojo der
  
  // SONRISA
  ctx.fillStyle = eyes;
  ctx.fillRect(12, 15, 1, 1);    // Inicio sonrisa izq
  ctx.fillRect(13, 16, 6, 1);    // Línea central sonrisa
  ctx.fillRect(21, 15, 1, 1);    // Fin sonrisa der
  
  // CUERPO DEL HOODIE
  // Cuello/apertura del hoodie
  ctx.fillStyle = hoodieLight;
  ctx.fillRect(9, 14, 14, 3);    // Cuello/apertura
  
  // Cuerpo principal
  ctx.fillStyle = hoodie;
  ctx.fillRect(7, 17, 18, 10);   // Torso principal
  ctx.fillRect(6, 20, 20, 5);    // Parte media más ancha
  
  // Detalles del cuerpo - línea central del hoodie
  ctx.fillStyle = hoodieDark;
  ctx.fillRect(15, 17, 2, 10);   // Línea vertical central
  
  // Sombras laterales del cuerpo
  ctx.fillRect(6, 20, 2, 7);     // Sombra izquierda
  ctx.fillRect(24, 20, 2, 7);    // Sombra derecha
  
  // Parte inferior del hoodie
  ctx.fillStyle = hoodieDark;
  ctx.fillRect(7, 27, 18, 2);    // Borde inferior
  
  // BOLSILLO FRONTAL (detalle característico)
  ctx.fillStyle = hoodieDark;
  ctx.fillRect(10, 22, 12, 1);   // Línea superior del bolsillo
  ctx.fillRect(10, 22, 1, 3);    // Lateral izq
  ctx.fillRect(21, 22, 1, 3);    // Lateral der
  
  // Detalles de costuras
  ctx.fillStyle = outline;
  ctx.fillRect(9, 17, 1, 2);     // Costura hombro izq
  ctx.fillRect(22, 17, 1, 2);    // Costura hombro der
  
  // LUCES/HIGHLIGHTS para dar volumen
  ctx.fillStyle = hoodieLight;
  ctx.fillRect(11, 18, 4, 1);    // Luz hombro izq
  ctx.fillRect(19, 18, 4, 1);    // Luz hombro der
  ctx.fillRect(13, 23, 6, 1);    // Luz pecho central
  
  // CONTORNO GENERAL (outline para mejor definición)
  ctx.fillStyle = outline;
  // Bordes laterales
  ctx.fillRect(6, 19, 1, 1);     // Borde izq superior
  ctx.fillRect(25, 19, 1, 1);     // Borde der superior
  ctx.fillRect(5, 21, 1, 5);      // Borde izq medio
  ctx.fillRect(26, 21, 1, 5);     // Borde der medio
  
  return c.toDataURL();
}

function createBugSprite(color) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const hex = '#' + color.toString(16).padStart(6, '0');
  ctx.fillStyle = hex;
  // Cuerpo
  ctx.fillRect(6, 7, 4, 3);
  // Cabeza
  ctx.fillRect(7, 5, 2, 3);
  // Patas
  ctx.fillRect(4, 9, 2, 1);
  ctx.fillRect(10, 9, 2, 1);
  ctx.fillRect(5, 11, 1, 2);
  ctx.fillRect(10, 11, 1, 2);
  // Antenas
  ctx.fillRect(8, 3, 1, 2);
  ctx.fillRect(7, 2, 3, 1);
  return c.toDataURL();
}

function create() {
  sceneRef = this;
  g = this.add.graphics();
  
  // Always start with title screen
  // Load high score
  let highScore = 0;
  try {
    highScore = parseInt(localStorage.getItem('hackerSurvivorsHighScore') || '0');
  } catch(e) {}
  // Show title screen
  showTitleScreen(highScore);
}

function showTitleScreen(highScore) {
  state = MENU;
  
  // Clear any existing UI elements
  if (uiTexts) {
    if (uiTexts.hp) uiTexts.hp.destroy();
    if (uiTexts.time) uiTexts.time.destroy();
    if (uiTexts.xp) uiTexts.xp.destroy();
    if (uiTexts.gold) uiTexts.gold.destroy();
    uiTexts = null;
  }
  
  // Clear graphics
  g.clear();
  
  const overlay = sceneRef.add.graphics();
  overlay.fillStyle(0x000000, 1);
  overlay.fillRect(0, 0, 800, 600);
  
  sceneRef.add.text(400, 200, 'HACKER SURVIVORS', {
    fontSize: '56px',
    fontFamily: 'Arial',
    color: '#00ffff'
  }).setOrigin(0.5);
  
  sceneRef.add.text(400, 280, 'Survive waves of digital threats!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  if (highScore > 0) {
    const minutes = Math.floor(highScore / 60000);
    const seconds = Math.floor((highScore % 60000) / 1000);
    sceneRef.add.text(400, 330, 'Best Time: ' + minutes + ':' + String(seconds).padStart(2, '0'), {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
  }
  
  const startText = sceneRef.add.text(400, 400, 'Press SPACE to Start', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  sceneRef.tweens.add({
    targets: startText,
    alpha: { from: 1, to: 0.3 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // Configurar evento de teclado para SPACE
  const spaceKey = sceneRef.input.keyboard.addKey('SPACE');
  spaceKey.once('down', () => {
    startGame();
  });
}

function startGame() {
  // Clear title screen graphics and text
  if (p && p.sprite) p.sprite.destroy();
  if (enemies && enemies.length > 0) {
    for (let e of enemies) if (e && e.sprite) e.sprite.destroy();
  }
  sceneRef.children.removeAll();
  g = sceneRef.add.graphics();
  initGame();
}

function initGame() {
  g = sceneRef.add.graphics();
  state = PLAYING;
  
  // Initialize player
  p = {
    x: 400,
    y: 300,
    spd: 150,
    rad: 8,
    sprite: sceneRef.add.sprite(400, 300, 'hacker').setScale(2).setOrigin(0.5)
  };
  maxHp = 100;
  hp = maxHp;
  
  // Initialize arrays
  enemies = [];
  projs = [];
  xpCrys = [];
  goldDrops = [];
  wpns = [];
  particles = [];
  lvl = 1;
  xp = 0;
  gold = 0;
  spawnT = 0;
  lastFire = 0;
  gameTime = 0;
  startTime = Date.now();
  xpGain = 1;
  pickupRange = 100;
  allDmgMult = 1;
  kills = 0;
  
  // Keyboard input
  keys = sceneRef.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT');
  
  // Initialize Firewall weapon
  wpns.push({
    type: 'firewall',
    dmg: 10,
    rate: 1000,
    lastFire: 0,
    lvl: 1
  });
  
  // UI elements
  uiTexts = {
    hp: sceneRef.add.text(16, 16, 'HP: 100/100', { fontSize: '20px', fontFamily: 'Arial', color: '#00ffff' }),
    time: sceneRef.add.text(684, 16, 'TIME: 0:00', { fontSize: '20px', fontFamily: 'Arial', color: '#00ffff' }),
    gold: sceneRef.add.text(220, 16, 'Gold: 0', { fontSize: '20px', fontFamily: 'Arial', color: '#ffaa00' }),
    xp: sceneRef.add.text(16, 564, 'XP: 0/5 [Lvl 1]', { fontSize: '20px', fontFamily: 'Arial', color: '#ffff00' })
  };
  
  // Initial enemy spawn
  spawnEnemy('bug');
}

function update(time, delta) {
  if (state === MENU) {
    // Animate title screen background
    g.clear();
    const t = time * 0.001;
    for (let i = 0; i < 20; i++) {
      const x = 400 + Math.cos(t + i) * 300;
      const y = 300 + Math.sin(t * 0.5 + i) * 200;
      g.fillStyle(0x001122, 0.3);
      g.fillCircle(x, y, 3);
    }
    return;
  }
  if (state === LEVELUP || state === SHOP) return;
  if (state !== PLAYING) return;
  
  // Check for shop keypress (SHIFT)
  if (keys.SHIFT && keys.SHIFT.isDown) {
    const now = time;
    if (!keys.lastShopPress || now - keys.lastShopPress > 500) {
      keys.lastShopPress = now;
      showShop();
    }
  }
  
  // Update game time
  gameTime += delta;
  
  // Player movement
  let dx = 0, dy = 0;
  if (keys.W.isDown || keys.UP.isDown) dy = -1;
  if (keys.S.isDown || keys.DOWN.isDown) dy = 1;
  if (keys.A.isDown || keys.LEFT.isDown) dx = -1;
  if (keys.D.isDown || keys.RIGHT.isDown) dx = 1;
  
  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    p.x += dx * p.spd * (delta / 1000);
    p.y += dy * p.spd * (delta / 1000);
    
    // Keep player on screen
    p.x = Math.max(p.rad, Math.min(800 - p.rad, p.x));
    p.y = Math.max(p.rad, Math.min(600 - p.rad, p.y));
    
    // Update player sprite position
    if (p.sprite) {
      p.sprite.setPosition(p.x, p.y);
    }
  }
  
  // Enemy spawning (wave system)
  const wave = Math.floor(gameTime / 30000);
  const baseSpawnRate = Math.max(500, 2000 - wave * 100);
  spawnT += delta;
  if (spawnT > baseSpawnRate) {
    spawnT = 0;
    const maxEnemies = Math.min(100, 10 + wave * 2);
    if (enemies.length < maxEnemies) {
      // Spawn based on wave
      const rand = Math.random();
      if (wave < 2 || rand < 0.6) {
        spawnEnemy('bug');
      } else if (wave < 5 || rand < 0.85) {
        spawnEnemy('virus');
      } else {
        spawnEnemy('trojan');
      }
    }
  }
  
  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dist = Math.sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2);
    if (dist > 0) {
      let dx = (p.x - e.x) / dist;
      let dy = (p.y - e.y) / dist;
      
      // Virus has erratic movement
      if (e.type === 'virus') {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      }
      
      e.x += dx * e.spd * (delta / 1000);
      e.y += dy * e.spd * (delta / 1000);
      
      // Update enemy sprite position
      if (e.sprite) {
        e.sprite.setPosition(e.x, e.y);
      }
    }
    
    // Check enemy collision with player
    const pd = Math.sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2);
    if (pd < p.rad + e.rad) {
      const dmg = e.type === 'trojan' ? 25 : (e.type === 'virus' ? 5 : 10);
      hp -= dmg;
      playTone(sceneRef, 150, 0.2);
      sceneRef.cameras.main.shake(200, 0.01);
      createParticles(e.x, e.y, 0xff0000, 8);
      if (enemies[i].sprite) enemies[i].sprite.destroy();
      enemies.splice(i, 1);
      if (hp <= 0) {
        endGame();
        return;
      }
      continue;
    }
  }
  
  const now = time;
  
  // Update projectiles
  for (let i = projs.length - 1; i >= 0; i--) {
    const proj = projs[i];
    
    // Handle boomerang return
    if (proj.owner === 'hook') {
      const distFromStart = Math.sqrt((proj.x - proj.startX) ** 2 + (proj.y - proj.startY) ** 2);
      if (distFromStart > 300 && !proj.returning) {
        proj.returning = true;
        const dx = p.x - proj.x;
        const dy = p.y - proj.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          proj.vx = (dx / len) * 400;
          proj.vy = (dy / len) * 400;
        }
      }
      if (proj.returning) {
        const distToPlayer = Math.sqrt((proj.x - p.x) ** 2 + (proj.y - p.y) ** 2);
        if (distToPlayer < 20) {
          projs.splice(i, 1);
          continue;
        }
      }
    }
    
    proj.x += proj.vx * (delta / 1000);
    proj.y += proj.vy * (delta / 1000);
    
    // Remove if off screen (unless returning hook)
    if (proj.owner !== 'hook' || !proj.returning) {
      if (proj.x < -50 || proj.x > 850 || proj.y < -50 || proj.y > 650) {
        projs.splice(i, 1);
        continue;
      }
    }
    
    // Check collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const d = Math.sqrt((proj.x - e.x) ** 2 + (proj.y - e.y) ** 2);
      if (d < proj.rad + e.rad) {
        e.hp -= proj.dmg;
        playTone(sceneRef, 100, 0.05);
        createParticles(e.x, e.y, e.color, 4);
        if (e.hp <= 0) {
          xpCrys.push({ x: e.x, y: e.y, rad: 5, val: e.xp });
          goldDrops.push({ x: e.x, y: e.y, rad: 4, val: e.gold || Math.floor(e.xp * 2) });
          createParticles(e.x, e.y, e.color, 12);
          if (enemies[j].sprite) enemies[j].sprite.destroy();
          enemies.splice(j, 1);
          kills++;
        }
        // Hook can hit multiple times if returning
        if (proj.owner !== 'hook' || !proj.returning) {
          projs.splice(i, 1);
          break;
        }
      }
    }
  }
  
  // Update XP crystals
  for (let i = xpCrys.length - 1; i >= 0; i--) {
    const crys = xpCrys[i];
    const dist = Math.sqrt((p.x - crys.x) ** 2 + (p.y - crys.y) ** 2);
    if (dist < pickupRange) {
      const pull = 300;
      const d = Math.max(1, dist);
      crys.x += ((p.x - crys.x) / d) * pull * (delta / 1000);
      crys.y += ((p.y - crys.y) / d) * pull * (delta / 1000);
    }
    
    const pd = Math.sqrt((p.x - crys.x) ** 2 + (p.y - crys.y) ** 2);
    if (pd < p.rad + crys.rad) {
      xp += Math.floor(crys.val * xpGain);
      playTone(sceneRef, 600, 0.1);
      createParticles(crys.x, crys.y, 0xffff00, 6);
      xpCrys.splice(i, 1);
      
      const reqXp = 5 + (lvl - 1) * 5;
      if (xp >= reqXp) {
        xp -= reqXp;
        lvl++;
        showLevelUp();
      }
    }
  }
  
  // Update gold drops
  for (let i = goldDrops.length - 1; i >= 0; i--) {
    const drop = goldDrops[i];
    const dist = Math.sqrt((p.x - drop.x) ** 2 + (p.y - drop.y) ** 2);
    if (dist < pickupRange) {
      const pull = 300;
      const d = Math.max(1, dist);
      drop.x += ((p.x - drop.x) / d) * pull * (delta / 1000);
      drop.y += ((p.y - drop.y) / d) * pull * (delta / 1000);
    }
    
    const pd = Math.sqrt((p.x - drop.x) ** 2 + (p.y - drop.y) ** 2);
    if (pd < p.rad + drop.rad) {
      gold += drop.val;
      playTone(sceneRef, 800, 0.1);
      createParticles(drop.x, drop.y, 0xffaa00, 6);
      goldDrops.splice(i, 1);
    }
  }
  
  // Update weapons
  for (let w of wpns) {
    if (w.type === 'firewall' && now - w.lastFire >= w.rate) {
      fireFirewall(w, now);
      w.lastFire = now;
    } else if (w.type === 'malware' && now - w.lastFire >= w.rate) {
      fireMalware(w, now);
      w.lastFire = now;
    } else if (w.type === 'ddos') {
      updateDDoS(w, now);
    } else if (w.type === 'hook' && now - w.lastFire >= w.rate) {
      fireHook(w, now);
      w.lastFire = now;
    }
  }
  
  // Update DDoS area damage
  for (let w of wpns) {
    if (w.type === 'ddos') {
      const range = 80 + w.lvl * 10;
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const d = Math.sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2);
      if (d < range && now - (e.lastDDoS || 0) >= 200) {
        e.hp -= w.dmg;
        e.lastDDoS = now;
        createParticles(e.x, e.y, e.color, 2);
        if (e.hp <= 0) {
          xpCrys.push({ x: e.x, y: e.y, rad: 5, val: e.xp });
          goldDrops.push({ x: e.x, y: e.y, rad: 4, val: e.gold || Math.floor(e.xp * 2) });
          createParticles(e.x, e.y, e.color, 12);
          if (enemies[i].sprite) enemies[i].sprite.destroy();
          enemies.splice(i, 1);
          kills++;
        }
      }
      }
    }
  }
  
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const part = particles[i];
    part.x += part.vx * (delta / 1000);
    part.y += part.vy * (delta / 1000);
    part.life -= delta;
    part.alpha = Math.max(0, part.life / 500);
    if (part.life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Update UI
  const minutes = Math.floor(gameTime / 60000);
  const seconds = Math.floor((gameTime % 60000) / 1000);
  uiTexts.time.setText('TIME: ' + minutes + ':' + String(seconds).padStart(2, '0'));
  uiTexts.hp.setText('HP: ' + Math.max(0, Math.floor(hp)) + '/' + maxHp);
  uiTexts.gold.setText('Gold: ' + gold);
  const reqXp = 5 + (lvl - 1) * 5;
  uiTexts.xp.setText('XP: ' + xp + '/' + reqXp + ' [Lvl ' + lvl + ']');
  
  drawGame();
}

function spawnEnemy(type) {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  
  if (edge === 0) { x = Math.random() * 800; y = -20; }
  else if (edge === 1) { x = 820; y = Math.random() * 600; }
  else if (edge === 2) { x = Math.random() * 800; y = 620; }
  else { x = -20; y = Math.random() * 600; }
  
  if (type === 'bug') {
    const e = {
      type: 'bug',
      x: x,
      y: y,
      hp: 20,
      maxHp: 20,
      spd: 80,
      rad: 8,
      xp: 1,
      gold: 2,
      color: 0xff0000,
      sprite: sceneRef.add.sprite(x, y, 'bug').setScale(2).setOrigin(0.5)
    };
    enemies.push(e);
  } else if (type === 'virus') {
    spriteKey = 'virus';
    const e = {
      type: 'virus',
      x: x,
      y: y,
      hp: 10,
      maxHp: 10,
      spd: 140,
      rad: 6,
      xp: 2,
      gold: 4,
      color: 0xff00ff,
      sprite: sceneRef.add.sprite(x, y, 'virus').setScale(2).setOrigin(0.5)
    };
    enemies.push(e);
  } else if (type === 'trojan') {
    spriteKey = 'trojan';
    const e = {
      type: 'trojan',
      x: x,
      y: y,
      hp: 80,
      maxHp: 80,
      spd: 50,
      rad: 12,
      xp: 5,
      gold: 10,
      color: 0x0000ff,
      sprite: sceneRef.add.sprite(x, y, 'trojan').setScale(2.5).setOrigin(0.5)
    };
    enemies.push(e);
  }
}

function fireFirewall(w, now) {
  // Find nearest enemy
  let nearest = null;
  let minDist = Infinity;
  
  for (let e of enemies) {
    const dist = Math.sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = e;
    }
  }
  
  if (nearest) {
    const dx = nearest.x - p.x;
    const dy = nearest.y - p.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0) {
      const spd = 400;
      projs.push({
        x: p.x,
        y: p.y,
        vx: (dx / len) * spd,
        vy: (dy / len) * spd,
        dmg: Math.floor(w.dmg * allDmgMult),
        rad: 4,
        color: 0x00ff00
      });
      playTone(sceneRef, 200, 0.1);
    }
  }
}

function drawGame() {
  g.clear();
  
  // Draw DDoS aura
  for (let w of wpns) {
    if (w.type === 'ddos') {
      const range = 80 + w.lvl * 10;
      g.lineStyle(2, 0x00ff00, 0.3);
      g.strokeCircle(p.x, p.y, range);
    }
  }
  
  // Player and enemies are now sprites, no need to draw them here
  
  // Draw projectiles
  for (let proj of projs) {
    g.fillStyle(proj.color, 1);
    g.fillCircle(proj.x, proj.y, proj.rad);
  }
  
  // Draw XP crystals
  for (let crys of xpCrys) {
    g.fillStyle(0xffff00, 1);
    g.fillCircle(crys.x, crys.y, crys.rad);
  }
  
  // Draw gold drops
  for (let drop of goldDrops) {
    g.fillStyle(0xffaa00, 1);
    g.fillCircle(drop.x, drop.y, drop.rad);
  }
  
  // Draw particles
  for (let part of particles) {
    g.fillStyle(part.color, part.alpha);
    g.fillCircle(part.x, part.y, part.rad);
  }
  
  // Draw HP bar
  g.fillStyle(0x333333, 1);
  g.fillRect(16, 48, 200, 12);
  g.fillStyle(0xff0000, 1);
  g.fillRect(16, 48, (hp / maxHp) * 200, 12);
  
  // Draw XP bar
  const reqXp = 5 + (lvl - 1) * 5;
  g.fillStyle(0x333333, 1);
  g.fillRect(16, 596, 200, 8);
  g.fillStyle(0xffff00, 1);
  g.fillRect(16, 596, (xp / reqXp) * 200, 8);
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 50 + Math.random() * 100;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rad: 2 + Math.random() * 3,
      color: color,
      life: 500,
      alpha: 1
    });
  }
}

function endGame() {
  state = GAMEOVER;
  playTone(sceneRef, 220, 0.5);
  setTimeout(() => playTone(sceneRef, 180, 0.3), 100);
  setTimeout(() => playTone(sceneRef, 140, 0.3), 200);
  
  // Save high score
  try {
    const stored = parseInt(localStorage.getItem('hackerSurvivorsHighScore') || '0');
    if (gameTime > stored) {
      localStorage.setItem('hackerSurvivorsHighScore', gameTime.toString());
    }
  } catch(e) {}
  
  const overlay = sceneRef.add.graphics();
  overlay.fillStyle(0x000000, 0.7);
  overlay.fillRect(0, 0, 800, 600);
  
  const minutes = Math.floor(gameTime / 60000);
  const seconds = Math.floor((gameTime % 60000) / 1000);
  
  sceneRef.add.text(400, 250, 'GAME OVER', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ff0000'
  }).setOrigin(0.5);
  
  sceneRef.add.text(400, 320, 'Survived: ' + minutes + ':' + String(seconds).padStart(2, '0'), {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ffff'
  }).setOrigin(0.5);
  
  sceneRef.add.text(400, 370, 'Kills: ' + kills, {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#00ffff'
  }).setOrigin(0.5);
  
  sceneRef.add.text(400, 450, 'Press SPACE to Restart', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // Configurar evento de teclado para SPACE para reiniciar
  const spaceKey = sceneRef.input.keyboard.addKey('SPACE');
  spaceKey.once('down', () => {
    sceneRef.scene.restart();
  });
}

function fireMalware(w, now) {
  const dirs = 8;
  const spd = 300;
  for (let i = 0; i < dirs; i++) {
    const angle = (i / dirs) * Math.PI * 2;
    projs.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      dmg: Math.floor(w.dmg * allDmgMult),
      rad: 4,
      color: 0x00ff00
    });
  }
  playTone(sceneRef, 200, 0.1);
}

function fireHook(w, now) {
  const nearest = findNearestEnemy();
  if (nearest) {
    const dx = nearest.x - p.x;
    const dy = nearest.y - p.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      const spd = 350;
      const hook = {
        x: p.x,
        y: p.y,
        vx: (dx / len) * spd,
        vy: (dy / len) * spd,
        dmg: Math.floor(w.dmg * allDmgMult),
        rad: 5,
        color: 0xff00ff,
        owner: 'hook',
        startX: p.x,
        startY: p.y,
        returning: false
      };
      projs.push(hook);
      playTone(sceneRef, 200, 0.1);
    }
  }
}

function updateDDoS(w, now) {
  // Continuous damage handled in update loop
}

function findNearestEnemy() {
  let nearest = null;
  let minDist = Infinity;
  for (let e of enemies) {
    const dist = Math.sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = e;
    }
  }
  return nearest;
}

function showShop() {
  state = SHOP;
  playTone(sceneRef, 440, 0.2);
  
  const overlay = sceneRef.add.graphics();
  overlay.fillStyle(0x000000, 0.85);
  overlay.fillRect(0, 0, 800, 600);
  
  const title = sceneRef.add.text(400, 80, 'TREASURE SHOP', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffaa00'
  }).setOrigin(0.5);
  
  const goldText = sceneRef.add.text(400, 130, 'Gold: ' + gold, {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffaa00'
  }).setOrigin(0.5);
  
  // Generate shop items
  const items = getShopItems();
  upgradeCards = [];
  
  for (let i = 0; i < Math.min(4, items.length); i++) {
    const item = items[i];
    const cardX = 150 + (i % 2) * 400;
    const cardY = 250 + Math.floor(i / 2) * 200;
    
    const card = sceneRef.add.graphics();
    card.fillStyle(0x1a1a1a, 1);
    const canAfford = gold >= item.cost;
    card.lineStyle(2, canAfford ? 0xffaa00 : 0x666666, 1);
    card.fillRect(cardX - 150, cardY - 70, 300, 140);
    card.strokeRect(cardX - 150, cardY - 70, 300, 140);
    
    const name = sceneRef.add.text(cardX, cardY - 40, item.name, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: canAfford ? '#ffaa00' : '#666666'
    }).setOrigin(0.5);
    
    const desc = sceneRef.add.text(cardX, cardY + 10, item.desc, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const cost = sceneRef.add.text(cardX, cardY + 50, 'Cost: ' + item.cost + ' Gold', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: canAfford ? '#00ff00' : '#ff0000'
    }).setOrigin(0.5);
    
    upgradeCards.push({ card, name, desc, cost, opt: item, x: cardX, y: cardY });
  }
  
  const closeText = sceneRef.add.text(400, 550, 'Press ESC or SHIFT to Close', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // Click handler
  const clickHandler = (pointer) => {
    for (let i = 0; i < upgradeCards.length; i++) {
      const uc = upgradeCards[i];
      const dx = pointer.x - uc.x;
      const dy = pointer.y - uc.y;
      if (dx >= -150 && dx <= 150 && dy >= -70 && dy <= 70) {
        if (gold >= uc.opt.cost) {
          gold -= uc.opt.cost;
          applyUpgrade(uc.opt);
          playTone(sceneRef, 600, 0.15);
          closeShop();
        } else {
          playTone(sceneRef, 200, 0.1);
        }
        break;
      }
    }
  };
  
  const closeShop = () => {
    state = PLAYING;
    overlay.destroy();
    title.destroy();
    goldText.destroy();
    closeText.destroy();
    for (let uc2 of upgradeCards) {
      uc2.card.destroy();
      uc2.name.destroy();
      uc2.desc.destroy();
      uc2.cost.destroy();
    }
    upgradeCards = [];
    sceneRef.input.off('pointerdown', clickHandler);
    keys.ESC.off('down');
    keys.SHIFT.off('down');
  };
  
  sceneRef.input.once('pointerdown', clickHandler);
  keys.ESC = sceneRef.input.keyboard.addKey('ESC');
  keys.SHIFT = sceneRef.input.keyboard.addKey('SHIFT');
  keys.ESC.once('down', closeShop);
  keys.SHIFT.once('down', () => {
    if (state === SHOP) closeShop();
  });
}

function getShopItems() {
  const items = [];
  
  // Weapon unlocks
  const hasMalware = wpns.some(w => w.type === 'malware');
  const hasDDoS = wpns.some(w => w.type === 'ddos');
  const hasHook = wpns.some(w => w.type === 'hook');
  
  if (!hasMalware) items.push({ type: 'weapon', name: 'Malware Spread', desc: '8-directional attack', weapon: 'malware', cost: 50 });
  if (!hasDDoS) items.push({ type: 'weapon', name: 'DDoS Attack', desc: 'Area damage aura', weapon: 'ddos', cost: 75 });
  if (!hasHook) items.push({ type: 'weapon', name: 'Phishing Hook', desc: 'Boomerang projectile', weapon: 'hook', cost: 60 });
  
  // Permanent upgrades
  items.push({ type: 'hp', name: '+20 Max HP', desc: 'Increase max health', cost: 40 });
  items.push({ type: 'speed', name: '+10% Speed', desc: 'Move faster', cost: 35 });
  items.push({ type: 'xpgain', name: '+15% XP Gain', desc: 'Earn more XP', cost: 45 });
  items.push({ type: 'pickup', name: '+5% Pickup Range', desc: 'Larger magnet range', cost: 30 });
  items.push({ type: 'damage', name: '+10% All Damage', desc: 'Boost all weapons', cost: 50 });
  items.push({ type: 'heal', name: 'Heal 50%', desc: 'Restore half HP', cost: 25 });
  
  // Weapon upgrades (if weapon exists)
  for (let w of wpns) {
    items.push({ type: 'weaponup', name: w.type.charAt(0).toUpperCase() + w.type.slice(1) + ' +1', desc: '+20% dmg, +15% rate', weapon: w.type, cost: 40 });
  }
  
  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  
  return items.slice(0, 4);
}

function showLevelUp() {
  state = LEVELUP;
  playTone(sceneRef, 440, 0.2);
  setTimeout(() => playTone(sceneRef, 550, 0.2), 100);
  setTimeout(() => playTone(sceneRef, 660, 0.2), 200);
  
  // Create overlay
  const overlay = sceneRef.add.graphics();
  overlay.fillStyle(0x000000, 0.8);
  overlay.fillRect(0, 0, 800, 600);
  
  const title = sceneRef.add.text(400, 100, 'LEVEL UP!', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ffff'
  }).setOrigin(0.5);
  
  // Generate 3 random upgrades
  const options = getUpgradeOptions();
  upgradeCards = [];
  
  for (let i = 0; i < 3; i++) {
    const opt = options[i];
    const cardX = 150 + i * 250;
    const cardY = 300;
    
    const card = sceneRef.add.graphics();
    card.fillStyle(0x1a1a1a, 1);
    card.lineStyle(2, 0x00ffff, 1);
    card.fillRect(cardX - 100, cardY - 80, 200, 160);
    card.strokeRect(cardX - 100, cardY - 80, 200, 160);
    
    const name = sceneRef.add.text(cardX, cardY - 40, opt.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ffff'
    }).setOrigin(0.5);
    
    const desc = sceneRef.add.text(cardX, cardY + 20, opt.desc, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    upgradeCards.push({ card, name, desc, opt, x: cardX, y: cardY });
  }
  
  // Click handler
  sceneRef.input.once('pointerdown', (pointer) => {
    for (let i = 0; i < upgradeCards.length; i++) {
      const uc = upgradeCards[i];
      const dx = pointer.x - uc.x;
      const dy = pointer.y - uc.y;
      if (dx >= -100 && dx <= 100 && dy >= -80 && dy <= 80) {
        applyUpgrade(uc.opt);
        state = PLAYING;
        overlay.destroy();
        title.destroy();
        for (let uc2 of upgradeCards) {
          uc2.card.destroy();
          uc2.name.destroy();
          uc2.desc.destroy();
        }
        upgradeCards = [];
        break;
      }
    }
  });
}

function getUpgradeOptions() {
  const all = [];
  
  // Weapon unlocks
  const hasMalware = wpns.some(w => w.type === 'malware');
  const hasDDoS = wpns.some(w => w.type === 'ddos');
  const hasHook = wpns.some(w => w.type === 'hook');
  
  if (!hasMalware) all.push({ type: 'weapon', name: 'Malware Spread', desc: '8-directional attack', weapon: 'malware' });
  if (!hasDDoS) all.push({ type: 'weapon', name: 'DDoS Attack', desc: 'Area damage aura', weapon: 'ddos' });
  if (!hasHook) all.push({ type: 'weapon', name: 'Phishing Hook', desc: 'Boomerang projectile', weapon: 'hook' });
  
  // Weapon level ups
  for (let w of wpns) {
    all.push({ type: 'weaponup', name: w.type.charAt(0).toUpperCase() + w.type.slice(1) + ' +1', desc: '+20% dmg, +15% rate', weapon: w.type });
  }
  
  // Character upgrades
  all.push({ type: 'hp', name: '+20 Max HP', desc: 'Increase max health' });
  all.push({ type: 'speed', name: '+10% Speed', desc: 'Move faster' });
  all.push({ type: 'xpgain', name: '+15% XP Gain', desc: 'Earn more XP' });
  all.push({ type: 'pickup', name: '+5% Pickup Range', desc: 'Larger magnet range' });
  all.push({ type: 'damage', name: '+10% All Damage', desc: 'Boost all weapons' });
  all.push({ type: 'heal', name: 'Heal 50%', desc: 'Restore half HP' });
  
  // Shuffle and pick 3
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 3);
}

function applyUpgrade(opt) {
  if (opt.type === 'weapon') {
    if (opt.weapon === 'malware') {
      wpns.push({ type: 'malware', dmg: 5, rate: 1200, lastFire: 0, lvl: 1 });
    } else if (opt.weapon === 'ddos') {
      wpns.push({ type: 'ddos', dmg: 3, rate: 0, lastFire: 0, lvl: 1 });
    } else if (opt.weapon === 'hook') {
      wpns.push({ type: 'hook', dmg: 12, rate: 1500, lastFire: 0, lvl: 1 });
    }
  } else if (opt.type === 'weaponup') {
    const w = wpns.find(w => w.type === opt.weapon);
    if (w) {
      w.lvl++;
      w.dmg = Math.floor(w.dmg * 1.2);
      w.rate = Math.floor(w.rate * 0.85);
    }
  } else if (opt.type === 'hp') {
    maxHp += 20;
    hp += 20;
  } else if (opt.type === 'speed') {
    p.spd = Math.floor(p.spd * 1.1);
  } else if (opt.type === 'xpgain') {
    xpGain *= 1.15;
  } else if (opt.type === 'pickup') {
    pickupRange = Math.floor(pickupRange * 1.05);
  } else if (opt.type === 'damage') {
    allDmgMult *= 1.1;
  } else if (opt.type === 'heal') {
    hp = Math.min(maxHp, Math.floor(hp + maxHp * 0.5));
  }
}

function playTone(scene, frequency, duration) {
  const audioContext = scene.sound.context;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}
