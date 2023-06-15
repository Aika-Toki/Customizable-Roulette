const fonts = [
  "Roboto",
  "Bagel Fat One",
  "Yuji Hentaigana Akebono",
  "PT Serif",
  "Anton",
  "Cormorant Garamond",
  "Orbitron",
  "Press Start 2P",
];

const themes = {
  light: {
    background: "#FAFBFC88",
    color: "#222626",
    lightness: 80,
    saturate: 70,
  },
  dark: {
    background: "#22262688",
    color: "#FAFBFC",
    lightness: 40,
    saturate: 60,
  },
};

function searchQuery() {
  let query = {};
  Array.from(
    location.search.slice(1, location.search.length).split("&")
  ).forEach((e) => {
    let param = e.split("=");
    query[param[0]] = param[1];
  });
  return query;
}

let query = searchQuery();
let min = query.hasOwnProperty("min") ? Number(query["min"]) : 1;
let max = query.hasOwnProperty("max") ? Number(query["max"]) : 10;
let font = query.hasOwnProperty("font")
  ? fonts[Number(query["font"])]
  : fonts[0];
let theme = query.hasOwnProperty("theme")
  ? themes[query.theme]
  : themes["light"];
let radius = query.hasOwnProperty("radius") ? query["radius"] + "px" : "8px";
let wheelFont = `16px '${font}'`;
let CentreFont = `bold 30px '${font}'`;
property("--background", theme.background);
property("--radius", radius);
let options = [];
for (let i = min; i <= max; i++) {
  options.push(i);
}

var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

Array.from(document.querySelectorAll(".spin")).forEach((e) => {
  e.addEventListener("click", startspin);
});

function property(name, value) {
  document.querySelector(":root").style.setProperty(name, value);
}

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return (
    String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
    nybHexString.substr(n & 0x0f, 1)
  );
}

function RGB2Color(r, g, b) {
  return "#" + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = (Math.PI * 2) / maxitem;

  red = Math.sin(frequency * item + 2 + phase) * width + center;
  green = Math.sin(frequency * item + 0 + phase) * width + center;
  blue = Math.sin(frequency * item + 4 + phase) * width + center;

  let hr = hslToRgb16((item / maxitem) * 360, theme.saturate, theme.lightness);
  console.log(hr);
  return (
    "#" +
    hr.red.padStart(2, "0") +
    hr.green.padStart(2, "0") +
    hr.blue.padStart(2, "0")
  );
  // return RGB2Color(red, green, blue);
}

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 120;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = theme.color;
    ctx.lineWidth = 1;

    ctx.font = wheelFont;

    for (var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, options.length);

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = theme.color;
      ctx.translate(
        250 + Math.cos(angle + arc / 2) * textRadius,
        250 + Math.sin(angle + arc / 2) * textRadius
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 5 + 4 * 1000;
  rotateWheel();
}
function startspin() {
  spin();
  Array.from(document.querySelectorAll(".spin")).forEach((e) => {
    e.removeEventListener("click", startspin);
  });
  // spin();
}

function rotateWheel() {
  spinTime += 10;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle =
    spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI) / 180;
  drawRouletteWheel();
  spinTimeout = setTimeout("rotateWheel()", 10);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = (startAngle * 180) / Math.PI + 90;
  var arcd = (arc * 180) / Math.PI;
  var index = Math.floor((360 - (degrees % 360)) / arcd);
  ctx.save();
  ctx.font = CentreFont;
  ctx.fillStyle = theme.color;
  var text = options[index];
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
  Array.from(document.querySelectorAll(".spin")).forEach((e) => {
    e.addEventListener("click", startspin);
  });
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

const hslToRgb16 = (hue, saturation, lightness) => {
  var result = false;

  if (
    (hue || hue === 0) &&
    hue <= 360 &&
    (saturation || saturation === 0) &&
    saturation <= 100 &&
    (lightness || lightness === 0) &&
    lightness <= 100
  ) {
    var red = 0,
      green = 0,
      blue = 0,
      q = 0,
      p = 0,
      hueToRgb;

    hue = Number(hue) / 360;
    saturation = Number(saturation) / 100;
    lightness = Number(lightness) / 100;

    if (saturation === 0) {
      red = lightness;
      green = lightness;
      blue = lightness;
    } else {
      hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;

        if (t < 1 / 6) {
          p += (q - p) * 6 * t;
        } else if (t < 1 / 2) {
          p = q;
        } else if (t < 2 / 3) {
          p += (q - p) * (2 / 3 - t) * 6;
        }

        return p;
      };

      if (lightness < 0.5) {
        q = lightness * (1 + saturation);
      } else {
        q = lightness + saturation - lightness * saturation;
      }
      p = 2 * lightness - q;

      red = hueToRgb(p, q, hue + 1 / 3);
      green = hueToRgb(p, q, hue);
      blue = hueToRgb(p, q, hue - 1 / 3);
    }

    result = {
      red: Math.round(red * 255).toString(16),
      green: Math.round(green * 255).toString(16),
      blue: Math.round(blue * 255).toString(16),
    };
  }

  return result;
};

drawRouletteWheel();

setTimeout(() => {
  drawRouletteWheel();
}, 300);
