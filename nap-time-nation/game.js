const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = 960;
const HEIGHT = 540;

const COLORS = {
  skyTop: [150, 130, 220],
  skyBottom: [255, 210, 190],
  mountain: "#5a5a96",
  groundDark: "#286e3c",
  groundLight: "#5aaa46",
  uiBg: "#14141e",
  uiBorder: "#faf0d2",
  text: "#fffaf0",
  chaos: "#dc3c3c",
  nap: "#5a8ce6",
  babySkin: "#fad2a0",
  babyOnesie: "#f0c83c"
};

const SCENES = [
  {
    id: "lobbyist",
    obstacleName: "LOBBYIST LARRY",
    obstacleShape: "briefcase",
    obstacleColor: "#3c3c46",
    dialogue: [
      "A man in a suit made entirely of dollar signs approaches,",
      "shaking a rattle shaped like a tax loophole."
    ],
    choices: [
      {
        text: "Distract with shiny golf cart",
        chaosDelta: -10,
        napDelta: 5,
        response: "Baby-in-Chief forgets Larry exists. Golf cart: $4M."
      },
      {
        text: "Let him sign the crayon bill",
        chaosDelta: 20,
        napDelta: -5,
        response: "The bill is now law. Nobody knows what it does."
      },
      {
        text: "Confront him directly",
        chaosDelta: 10,
        napDelta: 0,
        response: "Larry cries. Somehow you're the villain now."
      }
    ]
  },
  {
    id: "chyron",
    obstacleName: "CHYRON",
    obstacleShape: "screen",
    obstacleColor: "#c81e1e",
    dialogue: [
      "A living news ticker scrolls past, screaming three",
      "contradictory headlines at once."
    ],
    choices: [
      {
        text: "Mute it",
        chaosDelta: -5,
        napDelta: 5,
        response: "Blessed silence. Chyron seethes quietly."
      },
      {
        text: "Read all three headlines aloud",
        chaosDelta: 25,
        napDelta: -10,
        response: "Baby-in-Chief now believes all three. Simultaneously."
      },
      {
        text: "Bribe it with a scoop",
        chaosDelta: 5,
        napDelta: 0,
        response: "Chyron runs the scoop. Also two fake ones, for balance."
      }
    ]
  },
  {
    id: "senator",
    obstacleName: "SENATOR SOURPUSS",
    obstacleShape: "podium",
    obstacleColor: "#50326e",
    dialogue: [
      "A senator offers a nap-time extension in exchange for",
      "signing something nobody has read."
    ],
    choices: [
      {
        text: "Take the nap, skip reading it",
        chaosDelta: 15,
        napDelta: 15,
        response: "Nap secured. The bill legalizes hats indoors. Fine, actually."
      },
      {
        text: "Demand someone read it first",
        chaosDelta: -10,
        napDelta: -10,
        response: "An aide reads it. It takes four hours. No nap yet."
      },
      {
        text: "Nap anyway, ignore the senator",
        chaosDelta: 0,
        napDelta: 10,
        response: "Senator Sourpuss talks to an empty chair for a while."
      }
    ]
  },
  {
    id: "summit",
    obstacleName: "RIVAL TODDLER-IN-CHIEF",
    obstacleShape: "rival",
    obstacleColor: "#c87828",
    dialogue: [
      "A 'diplomatic summit' turns out to be a staring contest",
      "between two large babies in matching tiny suits."
    ],
    choices: [
      {
        text: "Let them stare it out",
        chaosDelta: -5,
        napDelta: 5,
        response: "A historic accord is reached. Nobody blinked. Nobody remembers why."
      },
      {
        text: "Interrupt with a juice box",
        chaosDelta: 10,
        napDelta: 0,
        response: "Peace talks collapse into a juice-based trade war."
      },
      {
        text: "Challenge the other Chief of Staff to rock-paper-scissors",
        chaosDelta: 5,
        napDelta: 5,
        response: "You lose. International relations now hinge on a rematch."
      }
    ]
  },
  {
    id: "fed",
    obstacleName: "THE FED CHAIR",
    obstacleShape: "babysitter",
    obstacleColor: "#325a3c",
    dialogue: [
      "A no-nonsense babysitter quietly removes the interest-rate",
      "building blocks from reach."
    ],
    choices: [
      {
        text: "Trust the babysitter, walk away",
        chaosDelta: -15,
        napDelta: 10,
        response: "The economy naps peacefully. Wild."
      },
      {
        text: "Demand the blocks back on live TV",
        chaosDelta: 20,
        napDelta: -10,
        response: "Markets do the thing where they wobble. Everyone pretends it's fine."
      }
    ]
  },
  {
    id: "ballot",
    obstacleName: "THE BALLOT BOX",
    obstacleShape: "box",
    obstacleColor: "#aa283c",
    dialogue: [
      "A ballot box rolls up and asks a series of increasingly",
      "loaded questions."
    ],
    choices: [
      {
        text: "Answer honestly",
        chaosDelta: -10,
        napDelta: 5,
        response: "The ballot box seems confused by honesty. It rolls off, unsettled."
      },
      {
        text: "Answer with a nap-time promise",
        chaosDelta: 5,
        napDelta: 15,
        response: "The crowd loves the nap-time platform. Landslide incoming."
      },
      {
        text: "Throw a tantrum instead of answering",
        chaosDelta: 25,
        napDelta: -5,
        response: "This is now the front page. Somehow, ratings are up."
      }
    ]
  }
];

const CHAOS_MAX = 100;
const NAP_MAX = 100;
const STARTING_CHAOS = 30;
const STARTING_NAP = 40;

const STATE = {
  INTRO: "intro",
  SCENE: "scene",
  RESPONSE: "response",
  END: "end"
};

let state = STATE.INTRO;
let sceneIndex = 0;
let chaos = STARTING_CHAOS;
let nap = STARTING_NAP;
let responseText = "";
let tick = 0;
let buttons = [];
let ending = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapText(text, width = 62) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = (current + " " + word).trim();
    if (test.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function getEnding() {
  if (nap >= NAP_MAX) {
    return {
      title: "ZEN NAP",
      subtitle: "Against all odds, everyone made it to nap time calmly.",
      color: "#78c8ff"
    };
  }

  if (chaos >= CHAOS_MAX) {
    return {
      title: "TANTRUM OF MASS DESTRUCTION",
      subtitle: "The rattle has been launched. Send snacks and thoughts.",
      color: "#ff6464"
    };
  }

  if (chaos >= 60) {
    return {
      title: "RE-ELECTED SOMEHOW",
      subtitle: "Chaos was sky-high the whole way through. You won anyway.",
      color: "#ffc85a"
    };
  }

  return {
    title: "STAFFER SURVIVES (BARELY)",
    subtitle: "Not peaceful, not a disaster. Just Tuesday.",
    color: "#c8dc96"
  };
}

function roundedRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawBackground() {
  const bands = 40;
  const bandHeight = HEIGHT * 0.55 / bands;

  for (let i = 0; i < bands; i++) {
    const t = i / bands;
    const color = COLORS.skyTop.map((v, c) =>
      Math.round(v + (COLORS.skyBottom[c] - v) * t)
    );
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillRect(0, i * bandHeight, WIDTH, bandHeight + 1);
  }

  ctx.fillStyle = COLORS.mountain;
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.lineTo(120, 220);
  ctx.lineTo(240, 320);
  ctx.lineTo(360, 240);
  ctx.lineTo(500, 320);
  ctx.lineTo(650, 200);
  ctx.lineTo(800, 320);
  ctx.lineTo(WIDTH, 260);
  ctx.lineTo(WIDTH, 340);
  ctx.lineTo(0, 340);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.groundDark;
  ctx.fillRect(0, 340, WIDTH, HEIGHT - 340);

  for (let x = 0; x < WIDTH; x += 24) {
    ctx.fillStyle = ((x / 24) % 2 === 0) ? COLORS.groundLight : COLORS.groundDark;
    ctx.fillRect(x, 340, 24, 14);
  }
}

function drawBaby() {
  const wobble = Math.floor(4 * ((Math.floor(tick / 20) % 2 === 0) ? 1 : -1));
  const cx = WIDTH / 4;
  const cy = 400 + wobble;

  ctx.fillStyle = COLORS.babyOnesie;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, 60, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.babySkin;
  ctx.beginPath();
  ctx.arc(cx, cy - 60, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a3c28";
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 105);
  ctx.lineTo(cx + 10, cy - 105);
  ctx.lineTo(cx, cy - 130);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#3c281e";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 75);
  ctx.lineTo(cx - 10, cy - 65);
  ctx.moveTo(cx + 35, cy - 75);
  ctx.lineTo(cx + 10, cy - 65);
  ctx.stroke();

  ctx.fillStyle = "#1e1e1e";
  ctx.beginPath();
  ctx.arc(cx - 18, cy - 58, 5, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy - 58, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b41e1e";
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 20);
  ctx.lineTo(cx + 8, cy - 20);
  ctx.lineTo(cx, cy + 20);
  ctx.closePath();
  ctx.fill();
}

function drawObstacle(scene) {
  const wobble = Math.floor(4 * ((Math.floor(tick / 20) % 2 === 0) ? 1 : -1));
  const cx = WIDTH * 0.72;
  const cy = 380 + wobble;
  const color = scene.obstacleColor;

  ctx.fillStyle = color;
  ctx.strokeStyle = "#191923";
  ctx.lineWidth = 3;

  if (scene.obstacleShape === "briefcase") {
    roundedRect(cx - 50, cy - 30, 100, 70, 6, color, "#191923", 3);
    ctx.fillStyle = "#dcbf3c";
    ctx.fillRect(cx - 15, cy - 45, 30, 20);
  } else if (scene.obstacleShape === "screen") {
    roundedRect(cx - 70, cy - 60, 140, 100, 4, "#141414", "#191923", 3);
    ctx.fillStyle = color;
    ctx.fillRect(cx - 60, cy - 20, 120, 20);
  } else if (scene.obstacleShape === "podium") {
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 40);
    ctx.lineTo(cx + 40, cy + 40);
    ctx.lineTo(cx + 25, cy - 40);
    ctx.lineTo(cx - 25, cy - 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.babySkin;
    ctx.beginPath();
    ctx.arc(cx, cy - 70, 30, 0, Math.PI * 2);
    ctx.fill();
  } else if (scene.obstacleShape === "rival") {
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 45, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.babySkin;
    ctx.beginPath();
    ctx.arc(cx, cy - 55, 40, 0, Math.PI * 2);
    ctx.fill();
  } else if (scene.obstacleShape === "babysitter") {
    roundedRect(cx - 35, cy - 60, 70, 120, 10, color, "#191923", 3);
    ctx.fillStyle = COLORS.babySkin;
    ctx.beginPath();
    ctx.arc(cx, cy - 75, 28, 0, Math.PI * 2);
    ctx.fill();
  } else if (scene.obstacleShape === "box") {
    roundedRect(cx - 45, cy - 35, 90, 70, 8, color, "#191923", 3);
    ctx.fillStyle = "#f0e6c8";
    ctx.fillRect(cx - 20, cy - 15, 40, 6);
  }
}

function drawText(text, x, y, size = 20, color = COLORS.text, align = "left") {
  ctx.font = `${size}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

function drawMeter(x, y, w, h, value, max, color, label) {
  drawText(label, x, y - 22, 16);
  roundedRect(x, y, w, h, 4, "#1e1e28", COLORS.uiBorder, 2);

  const fillW = Math.floor(w * clamp(value, 0, max) / max);
  roundedRect(x, y, fillW, h, 4, color, null);

  drawText(`${value}/${max}`, x + w - 8, y + 2, 14, COLORS.text, "right");
}

function drawHud() {
  drawMeter(30, 40, 260, 22, chaos, CHAOS_MAX, COLORS.chaos, "CHAOS");
  drawMeter(WIDTH - 290, 40, 260, 22, nap, NAP_MAX, COLORS.nap, "NAP TIME");
}

function drawDialogueBox(lines, yOffset = 0) {
  const box = {
    x: 30,
    y: HEIGHT - 190 + yOffset,
    w: WIDTH - 60,
    h: 90
  };

  roundedRect(box.x, box.y, box.w, box.h, 8, COLORS.uiBg, COLORS.uiBorder, 3);

  lines.forEach((line, i) => {
    drawText(line, box.x + 20, box.y + 14 + i * 24, 20);
  });
}

function drawButton(button) {
  const hover = button.hovered;
  roundedRect(
    button.x, button.y, button.w, button.h, 6,
    hover ? "#46465a" : "#2d2d3c",
    COLORS.uiBorder,
    2
  );

  const lines = wrapText(button.text, 40);
  lines.forEach((line, i) => {
    drawText(
      line,
      button.x + button.w / 2,
      button.y + 10 + i * 21,
      16,
      COLORS.text,
      "center"
    );
  });
}

function makeButton(x, y, w, h, text, action) {
  return { x, y, w, h, text, action, hovered: false };
}

function buildButtons() {
  buttons = [];

  if (state === STATE.INTRO) {
    buttons.push(makeButton(
      WIDTH / 2 - 100, HEIGHT - 120, 200, 60,
      "Start the day",
      startGame
    ));
  }

  if (state === STATE.SCENE) {
    const choices = SCENES[sceneIndex].choices;
    const n = choices.length;
    const btnW = 280;
    const btnH = 70;
    const gap = 20;
    const totalW = n * btnW + (n - 1) * gap;
    const startX = (WIDTH - totalW) / 2;
    const y = HEIGHT - 100;

    choices.forEach((choice, i) => {
      buttons.push(makeButton(
        startX + i * (btnW + gap),
        y,
        btnW,
        btnH,
        choice.text,
        () => handleChoice(choice)
      ));
    });
  }

  if (state === STATE.RESPONSE) {
    buttons.push(makeButton(
      WIDTH / 2 - 90, HEIGHT - 70, 180, 45,
      "Continue",
      advance
    ));
  }

  if (state === STATE.END) {
    buttons.push(makeButton(
      WIDTH / 2 - 110, HEIGHT - 110, 220, 55,
      "Play again",
      reset
    ));
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawBaby();

  if (state === STATE.INTRO) {
    drawText("NAP TIME NATION", WIDTH / 2, 60, 40, COLORS.text, "center");

    const introLines = wrapText(
      "Keep the giant toddler-brained Head of State calm through a gauntlet of lobbyists, cable news, and rival summits. Survive until nap time.",
      56
    );

    introLines.forEach((line, i) => {
      drawText(line, WIDTH / 2, 130 + i * 26, 20, COLORS.text, "center");
    });
  }

  if (state === STATE.SCENE) {
    const scene = SCENES[sceneIndex];
    drawObstacle(scene);
    drawText(scene.obstacleName, WIDTH * 0.72, 300, 20, "#ffe696", "center");
    drawDialogueBox(scene.dialogue, -90);
  }

  if (state === STATE.RESPONSE) {
    const scene = SCENES[sceneIndex];
    drawObstacle(scene);
    drawDialogueBox(wrapText(responseText), 0);
  }

  if (state === STATE.END) {
    drawText(ending.title, WIDTH / 2, 180, 40, ending.color, "center");

    const lines = wrapText(ending.subtitle, 56);
    lines.forEach((line, i) => {
      drawText(line, WIDTH / 2, 240 + i * 26, 20, COLORS.text, "center");
    });
  }

  drawHud();

  buttons.forEach(drawButton);
}

function pointInButton(px, py, button) {
  return (
    px >= button.x &&
    px <= button.x + button.w &&
    py >= button.y &&
    py <= button.y + button.h
  );
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * WIDTH / rect.width,
    y: (event.clientY - rect.top) * HEIGHT / rect.height
  };
}

canvas.addEventListener("mousemove", (event) => {
  const p = getCanvasPoint(event);
  buttons.forEach(button => {
    button.hovered = pointInButton(p.x, p.y, button);
  });
});

canvas.addEventListener("mouseleave", () => {
  buttons.forEach(button => button.hovered = false);
});

canvas.addEventListener("click", (event) => {
  const p = getCanvasPoint(event);

  for (const button of buttons) {
    if (pointInButton(p.x, p.y, button)) {
      button.action();
      break;
    }
  }
});

window.addEventListener("keydown", (event) => {
  if ((event.key === "r" || event.key === "R") && state === STATE.END) {
    reset();
  }
});

function startGame() {
  state = STATE.SCENE;
  sceneIndex = 0;
  buildButtons();
}

function handleChoice(choice) {
  chaos = clamp(chaos + choice.chaosDelta, 0, CHAOS_MAX);
  nap = clamp(nap + choice.napDelta, 0, NAP_MAX);
  responseText = choice.response;
  state = STATE.RESPONSE;
  buildButtons();
}

function advance() {
  if (chaos >= CHAOS_MAX || nap >= NAP_MAX) {
    goToEnd();
    return;
  }

  sceneIndex++;

  if (sceneIndex >= SCENES.length) {
    goToEnd();
  } else {
    state = STATE.SCENE;
    buildButtons();
  }
}

function goToEnd() {
  state = STATE.END;
  ending = getEnding();
  buildButtons();
}

function reset() {
  state = STATE.INTRO;
  sceneIndex = 0;
  chaos = STARTING_CHAOS;
  nap = STARTING_NAP;
  responseText = "";
  ending = null;
  buildButtons();
}

function loop() {
  tick++;
  draw();
  requestAnimationFrame(loop);
}

reset();
loop();
