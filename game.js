const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const restart = document.getElementById("restart");

const W = canvas.width, H = canvas.height;
let bird, pipes, score, highScore, running, started, gameOver, lastTime, spawnTimer;

highScore = Number(localStorage.getItem("flappyMakerLiteHighScore") || 0);

function reset() {
  bird = { x: 82, y: H/2, vy: 0, r: 14, rot: 0 };
  pipes = [];
  score = 0;
  running = false;
  started = false;
  gameOver = false;
  spawnTimer = 0;
  message.innerHTML = "<strong>FLAPPY MAKER LITE</strong><span>Tap or press Space to start</span>";
  message.classList.remove("hidden");
  draw();
}

function start() {
  if (gameOver) reset();
  if (!started) {
    started = true;
    running = true;
    message.classList.add("hidden");
    addPipe(W + 20);
  }
  bird.vy = -7.2;
}

function addPipe(x = W + 20) {
  const gap = 155;
  const min = 90, max = H - 90 - gap;
  const top = Math.random() * (max - min) + min;
  pipes.push({ x, w: 62, top, gap, passed:false });
}

function update(dt) {
  if (!running) return;
  const gravity = 21;
  bird.vy += gravity * dt;
  bird.y += bird.vy * dt;
  bird.rot = Math.max(-0.45, Math.min(1.15, bird.vy / 10));

  spawnTimer += dt;
  if (spawnTimer > 1.55) {
    spawnTimer = 0;
    addPipe();
  }

  for (const p of pipes) {
    p.x -= 155 * dt;
    if (!p.passed && p.x + p.w < bird.x) {
      p.passed = true;
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyMakerLiteHighScore", highScore);
      }
    }
    if (circleRectCollision(bird.x, bird.y, bird.r, p.x, 0, p.w, p.top) ||
        circleRectCollision(bird.x, bird.y, bird.r, p.x, p.top + p.gap, p.w, H)) {
      die();
    }
  }
  pipes = pipes.filter(p => p.x + p.w > -10);

  if (bird.y - bird.r < 0 || bird.y + bird.r > H - 45) die();
}

function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const x = Math.max(rx, Math.min(cx, rx + rw));
  const y = Math.max(ry, Math.min(cy, ry + rh));
  return (cx-x)*(cx-x) + (cy-y)*(cy-y) < r*r;
}

function die() {
  if (!running) return;
  running = false; gameOver = true;
  message.innerHTML = `<strong>GAME OVER</strong><span>Score: ${score} • Best: ${highScore}<br>Tap or press Space to try again</span>`;
  message.classList.remove("hidden");
}

function draw() {
  // sky
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,"#70c5ce"); grad.addColorStop(1,"#b7edf0");
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

  // clouds
  ctx.fillStyle = "rgba(255,255,255,.65)";
  for (const c of [{x:40,y:110,s:1},{x:260,y:180,s:.8},{x:180,y:70,s:.6}]) {
    ctx.beginPath(); ctx.arc(c.x,c.y,20*c.s,0,Math.PI*2);
    ctx.arc(c.x+24*c.s,c.y+2,15*c.s,0,Math.PI*2);
    ctx.arc(c.x-20*c.s,c.y+5,13*c.s,0,Math.PI*2); ctx.fill();
  }

  // pipes
  for (const p of pipes) {
    drawPipe(p.x, 0, p.w, p.top);
    drawPipe(p.x, p.top+p.gap, p.w, H-(p.top+p.gap));
  }

  // ground
  ctx.fillStyle="#ded895"; ctx.fillRect(0,H-45,W,45);
  ctx.fillStyle="#c6b85f"; ctx.fillRect(0,H-45,W,7);

  // bird
  ctx.save();
  ctx.translate(bird.x,bird.y); ctx.rotate(bird.rot);
  ctx.fillStyle="#f7d447"; ctx.beginPath(); ctx.arc(0,0,bird.r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(7,-6,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(8,-6,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#e88b2d"; ctx.beginPath(); ctx.moveTo(13,0); ctx.lineTo(25,5); ctx.lineTo(13,8); ctx.closePath(); ctx.fill();
  ctx.restore();

  // score
  ctx.fillStyle="#fff"; ctx.strokeStyle="rgba(0,0,0,.5)"; ctx.lineWidth=4;
  ctx.font="bold 44px Arial"; ctx.textAlign="center";
  ctx.strokeText(score, W/2, 62); ctx.fillText(score, W/2, 62);
}

function drawPipe(x,y,w,h) {
  if (h <= 0) return;
  ctx.fillStyle="#55b947"; ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#369536"; ctx.fillRect(x+7,y,8,h);
  ctx.fillStyle="#79d95d"; ctx.fillRect(x+w-10,y,6,h);
  ctx.fillStyle="#4aa53d"; ctx.fillRect(x-5,y+h-18,w+10,18);
  ctx.fillStyle="#77d65c"; ctx.fillRect(x,y+h-18,w,5);
}

let previous = performance.now();
function loop(now) {
  const dt = Math.min((now-previous)/1000, .035);
  previous = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function action(e) {
  if (e) e.preventDefault();
  start();
}
canvas.addEventListener("pointerdown", action);
document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp") action(e);
});
restart.addEventListener("click", reset);

reset();
requestAnimationFrame(loop);
