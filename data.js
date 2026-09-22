const COLORS = {
  gas:"#4b5563",
  nuclear:"#8b5cf6",
  solar:"#e8b02a",
  wind:"#3ba7a0",
  coal:"#202733",
  hydro:"#3b82f6",
  other:"#9aa4b2"
};

const LABELS = {
  gas:"Natural Gas",
  nuclear:"Nuclear",
  solar:"Solar",
  wind:"Wind",
  coal:"Coal",
  hydro:"Hydro",
  other:"Other"
};

const ORDER = [
  "gas",
  "nuclear",
  "solar",
  "wind",
  "coal",
  "hydro",
  "other"
];


const MODEL = {

  va:{

    name:"Virginia",

    actualGeneration:102.7,

    forecastGeneration:{
      2027:118,
      2030:137,
      2035:160
    },

    mix:{

      2024:{
        gas:59,
        nuclear:28,
        solar:7,
        wind:0,
        coal:2,
        hydro:1,
        other:3
      },

      2027:{
        gas:51,
        nuclear:25,
        solar:11,
        wind:8,
        coal:1,
        hydro:1,
        other:3
      },

      2030:{
        gas:48,
        nuclear:22,
        solar:16,
        wind:9,
        coal:1,
        hydro:1,
        other:3
      },

      2035:{
        gas:44,
        nuclear:18,
        solar:20,
        wind:14,
        coal:0,
        hydro:1,
        other:3
      }

    }

  },


  md:{

    name:"Maryland",

    actualGeneration:35.4,

    forecastGeneration:{
      2027:36,
      2030:38,
      2035:41
    },

    mix:{

      2024:{
        gas:39.3,
        nuclear:41.6,
        solar:2.9,
        wind:1.6,
        coal:7,
        hydro:5.2,
        other:2.4
      },

      2027:{
        gas:40,
        nuclear:41,
        solar:5,
        wind:2,
        coal:4,
        hydro:5,
        other:3
      },

      2030:{
        gas:38,
        nuclear:40,
        solar:8,
        wind:5,
        coal:1,
        hydro:5,
        other:3
      },

      2035:{
        gas:30,
        nuclear:38,
        solar:14,
        wind:10,
        coal:0,
        hydro:5,
        other:3
      }

    }

  }

};


// ==============================
// 24 HOUR MODEL
// ==============================

// These are simplified normalized model inputs.
// They are NOT actual hourly metered state data.

const VA_DEMAND = [
  61,59,58,57,58,62,
  70,78,83,86,88,89,
  90,92,94,96,100,104,
  107,105,98,88,76,67
];

const MD_DEMAND = [
  58,56,55,54,55,59,
  66,74,79,82,83,84,
  85,87,89,92,96,99,
  101,98,91,82,71,63
];

const SOLAR = [
  0,0,0,0,0,0,
  3,12,28,47,66,81,
  91,96,93,82,63,39,
  15,2,0,0,0,0
];

const WIND_VA = [
  45,44,43,41,40,38,
  36,33,31,29,28,28,
  29,31,34,38,43,49,
  54,57,58,56,52,48
];

const WIND_MD = [
  40,39,38,37,36,35,
  33,31,30,29,28,29,
  31,34,38,43,47,51,
  54,55,54,50,46,43
];


function pct(value){

  return (
    Math.round(value * 10) / 10
  )
  .toString()
  .replace(".0","") + "%";
}


function stackBarHTML(mix){

  return ORDER.map(function(key){

    return `
      <div
        class="seg"
        title="${LABELS[key]} ${pct(mix[key])}"
        style="
          width:${mix[key]}%;
          background:${COLORS[key]};
        "
      ></div>
    `;

  }).join("");

}


function legendHTML(mix){

  return ORDER.map(function(key){

    return `
      <div class="legend-item">

        <span
          class="legend-swatch"
          style="background:${COLORS[key]}"
        ></span>

        <span>
          ${LABELS[key]}
        </span>

        <strong>
          ${pct(mix[key])}
        </strong>

      </div>
    `;

  }).join("");

}


function renderCompareBars(containerId,year){

  const element =
    document.getElementById(containerId);

  if(!element){
    return;
  }

  const virginia =
    MODEL.va.mix[year];

  const maryland =
    MODEL.md.mix[year];


  element.innerHTML =
    ORDER.map(function(key){

      return `

        <div class="card">

          <h3>
            ${LABELS[key]}
          </h3>


          <div class="bar-row">

            <span class="label">
              Virginia
            </span>

            <div class="track">

              <div
                class="fill"
                style="
                  width:${virginia[key]}%;
                  background:var(--va);
                "
              ></div>

            </div>

            <span class="value">
              ${pct(virginia[key])}
            </span>

          </div>


          <div class="bar-row">

            <span class="label">
              Maryland
            </span>

            <div class="track">

              <div
                class="fill"
                style="
                  width:${maryland[key]}%;
                  background:var(--md);
                "
              ></div>

            </div>

            <span class="value">
              ${pct(maryland[key])}
            </span>

          </div>

        </div>

      `;

    }).join("");

}


function stateMixPage(state){

  const root =
    document.getElementById("state-mix-root");

  if(!root){
    return;
  }

  const data =
    MODEL[state];


  [2024,2027,2030,2035]
    .forEach(function(year){

      const bar =
        document.getElementById(
          "mix-" + year
        );

      const legend =
        document.getElementById(
          "legend-" + year
        );


      if(bar){

        bar.innerHTML =
          stackBarHTML(
            data.mix[year]
          );

      }


      if(legend){

        legend.innerHTML =
          legendHTML(
            data.mix[year]
          );

      }

    });

}


// ==============================
// DEMAND GRAPH
// ==============================

function polylinePoints(
  values,
  width,
  height,
  padX = 40,
  padY = 30
){

  const max = 110;

  const min = 50;


  return values.map(function(value,index){

    const x =
      padX +
      index *
      (width - 2 * padX) /
      (values.length - 1);


    const y =
      height -
      padY -
      (value - min) *
      (height - 2 * padY) /
      (max - min);


    return [x,y];

  });

}


function pointString(points){

  return points
    .map(function(point){

      return point.join(",");

    })
    .join(" ");

}


function renderDemandChart(hour = 18){

  const svg =
    document.getElementById(
      "demand-svg"
    );

  if(!svg){
    return;
  }


  const width = 900;

  const height = 330;

  const padX = 48;

  const padY = 30;


  const vaPoints =
    polylinePoints(
      VA_DEMAND,
      width,
      height,
      padX,
      padY
    );


  const mdPoints =
    polylinePoints(
      MD_DEMAND,
      width,
      height,
      padX,
      padY
    );


  const selectedX =
    vaPoints[hour][0];


  let grid = "";


  [60,70,80,90,100]
    .forEach(function(value){

      const y =
        height -
        padY -
        (value - 50) *
        (height - 2 * padY) /
        60;


      grid += `

        <line
          x1="${padX}"
          y1="${y}"
          x2="${width-padX}"
          y2="${y}"
          class="chart-grid-line"
        ></line>

        <text
          x="8"
          y="${y+4}"
          class="chart-axis-label"
        >
          ${value}
        </text>

      `;

    });


  [0,6,12,18,23]
    .forEach(function(hourValue){

      const x =
        padX +
        hourValue *
        (width - 2 * padX) /
        23;


      grid += `

        <text
          x="${x-9}"
          y="${height-6}"
          class="chart-axis-label"
        >
          ${String(hourValue).padStart(2,"0")}:00
        </text>

      `;

    });


  svg.setAttribute(
    "viewBox",
    `0 0 ${width} ${height}`
  );


  svg.innerHTML = `

    ${grid}


    <polyline
      points="${pointString(vaPoints)}"
      class="line-va"
    ></polyline>


    <polyline
      points="${pointString(mdPoints)}"
      class="line-md"
    ></polyline>


    <line
      x1="${selectedX}"
      y1="${padY}"
      x2="${selectedX}"
      y2="${height-padY}"
      class="cursor-line"
    ></line>


    <circle
      cx="${vaPoints[hour][0]}"
      cy="${vaPoints[hour][1]}"
      r="5"
      class="point-va"
    ></circle>


    <circle
      cx="${mdPoints[hour][0]}"
      cy="${mdPoints[hour][1]}"
      r="5"
      class="point-md"
    ></circle>

  `;


  document.getElementById(
    "chart-tooltip"
  ).innerHTML = `

    <strong>
      ${String(hour).padStart(2,"0")}:00
    </strong>

    <div>
      Virginia demand index:
      ${VA_DEMAND[hour]}
    </div>

    <div>
      Maryland demand index:
      ${MD_DEMAND[hour]}
    </div>

  `;

}


// ==============================
// DISPATCH MODEL
// ==============================

function dispatchFor(state,hour){

  const demand =
    (
      state === "va"
      ? VA_DEMAND
      : MD_DEMAND
    )[hour];


  const mix =
    MODEL[state].mix[2030];


  let nuclear =
    state === "va"
    ? 22
    : 38;


  let solar =
    mix.solar *
    (SOLAR[hour] / 100) *
    1.65;


  let wind =
    mix.wind *
    (
      (
        state === "va"
        ? WIND_VA
        : WIND_MD
      )[hour] / 45
    );


  let hydro =
    state === "va"
    ? 1.2
    : 4.6;


  let coal =
    0.8;


  let other =
    2.5;


  let storage;

  if(
    hour >= 17 &&
    hour <= 21
  ){

    storage = 4.5;

  }

  else if(
    hour >= 11 &&
    hour <= 15
  ){

    storage = -2.5;

  }

  else{

    storage = 0.5;

  }


  let fixed =
    nuclear +
    solar +
    wind +
    hydro +
    coal +
    other +
    Math.max(storage,0);


  let gas =
    Math.max(
      8,
      Math.min(
        60,
        demand - fixed
      )
    );


  let imports =
    Math.max(
      0,
      demand -
      (
        fixed +
        gas
      )
    );


  let total =
    nuclear +
    solar +
    wind +
    hydro +
    coal +
    other +
    Math.max(storage,0) +
    gas +
    imports;


  const scale =
    demand / total;


  const values = {

    nuclear:
      nuclear * scale,

    solar:
      solar * scale,

    wind:
      wind * scale,

    hydro:
      hydro * scale,

    coal:
      coal * scale,

    other:
      other * scale,

    gas:
      gas * scale,

    imports:
      imports * scale,

    storage:
      Math.max(
        storage,
        0
      ) * scale

  };


  return {

    demand:demand,

    values:values,

    charging:
      storage < 0
      ? Math.abs(storage)
      : 0

  };

}


function renderDispatch(
  state,
  hour,
  targetId
){

  const target =
    document.getElementById(
      targetId
    );

  if(!target){
    return;
  }


  const data =
    dispatchFor(
      state,
      hour
    );


  const rows = [

    ["nuclear","Nuclear"],

    ["solar","Solar"],

    ["wind","Wind"],

    ["hydro","Hydro"],

    ["gas","Natural Gas"],

    ["coal","Coal"],

    ["other","Other"],

    [
      "storage",
      "Storage discharge"
    ],

    [
      "imports",
      "Imports"
    ]

  ];


  target.innerHTML =

    rows.map(function(row){

      const key =
        row[0];

      const label =
        row[1];

      const value =
        data.values[key] || 0;

      const color =
        COLORS[key] ||
        "#2f6fed";


      return `

        <div class="bar-row">

          <span class="label">
            ${label}
          </span>

          <div class="track">

            <div
              class="fill"
              style="
                width:${Math.min(100,value)}%;
                background:${color};
              "
            ></div>

          </div>

          <span class="value">
            ${value.toFixed(1)}
          </span>

        </div>

      `;

    }).join("")


    +

    (
      data.charging

      ?

      `

      <div
        class="small"
        style="margin-top:10px"
      >

        Storage charging index:
        ${data.charging.toFixed(1)}

      </div>

      `

      :

      ""

    );

}


function initModelPage(){

  const slider =
    document.getElementById(
      "hour-slider"
    );


  if(!slider){
    return;
  }


  function update(){

    const hour =
      Number(
        slider.value
      );


    document.getElementById(
      "hour-readout"
    ).textContent =
      String(hour)
      .padStart(2,"0")
      + ":00";


    renderDemandChart(
      hour
    );


    renderDispatch(
      "va",
      hour,
      "va-dispatch"
    );


    renderDispatch(
      "md",
      hour,
      "md-dispatch"
    );

  }


  slider.addEventListener(
    "input",
    update
  );


  update();

}
