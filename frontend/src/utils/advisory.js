export const LIMITS = {
  windAtHeight: 7.5, 
  windLifting: 10.8,
  windGale: 17.2,
  tempFreeze: 2,
  tempCold: 5, 
  tempHot: 30,
  tempExtremeHeat: 38,
  humidityHigh: 85,
  humidityWatch: 75,
};

export const STATUS = {
  go: { label: "Clear to work", badge: "GO" },
  caution: { label: "Work with controls", badge: "CAUTION" },
  stop: { label: "Stand down", badge: "STOP" },
};

function windKmh(metresPerSecond) {
  return Math.round(metresPerSecond * 3.6);
}


export function getConditions(reading) {
  const weatherId = reading.weather[0].id;

  return {
    temp: reading.main.temp,
    feelsLike: reading.main.feels_like,
    humidity: reading.main.humidity,
    wind: reading.wind.speed,
    gust: reading.wind.gust, 
    description: reading.weather[0].description,
    rainChance: reading.pop || 0,
    rainMm: reading.rain ? reading.rain["3h"] || 0 : 0,
    storm: weatherId >= 200 && weatherId < 300, 
    wet: weatherId >= 300 && weatherId < 600,
    heavyRain: weatherId >= 502 && weatherId < 600,
    snow: weatherId >= 600 && weatherId < 700,
    lowVisibility: weatherId >= 700 && weatherId < 800,
  };
}

function stop(note, action) {
  return { status: "stop", note: note, action: action };
}

function caution(note, action) {
  return { status: "caution", note: note, action: action };
}

function fine() {
  return {
    status: "go",
    note: "Conditions are within normal working limits.",
    action: "",
  };
}


function checkConcrete(c) {
  if (c.storm || c.heavyRain) {
    return stop(
      "Rain will wash out fresh concrete and ruin the surface finish.",
      "Postpone the pour, or tent and cover the slab before any placement."
    );
  }
  if (c.temp < LIMITS.tempFreeze) {
    return stop(
      "At " + Math.round(c.temp) + "°C hydration stalls and the mix can freeze.",
      "Hold the pour until temperatures recover above 5°C."
    );
  }
  if (c.wet) {
    return caution(
      "Showers risk surface damage during placing and finishing.",
      "Keep polythene sheeting and covers on standby at the pour face."
    );
  }
  if (c.temp < LIMITS.tempCold) {
    return caution(
      "Cold-weather concreting: slow strength gain and frost risk overnight.",
      "Use insulating blankets, warm water in the mix, and extend formwork strike times."
    );
  }
  if (c.temp > LIMITS.tempHot) {
    return caution(
      "Heat drives rapid evaporation and plastic-shrinkage cracking.",
      "Pour early morning, add a retarder, and start curing immediately."
    );
  }
  return fine();
}

function checkRoofing(c) {
  if (c.storm || c.wet || c.snow) {
    return stop(
      "Membranes and adhesives will not bond to a wet deck.",
      "Reschedule roofing and seal any open deck areas today."
    );
  }
  if (c.wind >= LIMITS.windLifting) {
    return stop(
      "Wind at " + windKmh(c.wind) + " km/h makes sheets and membranes uncontrollable.",
      "Clear and tie down all loose sheeting and insulation on the roof."
    );
  }
  if (c.wind >= LIMITS.windAtHeight) {
    return caution(
      "Gusts make large sheets hard to handle at the edge.",
      "Work smaller sheet runs and add edge protection plus a second handler."
    );
  }
  if (c.humidity >= LIMITS.humidityHigh) {
    return caution(
      "Humidity at " + c.humidity + "% will slow or spoil the cure.",
      "Check the substrate for dew before priming any membrane."
    );
  }
  return fine();
}

function checkLifting(c) {
  if (c.storm) {
    return stop(
      "Lightning risk around the boom and hoist ropes.",
      "Park and slew the crane to free weathervane, then evacuate the lift zone."
    );
  }
  if (c.wind >= LIMITS.windLifting) {
    return stop(
      windKmh(c.wind) + " km/h is above the usual lifting limit for tower and mobile cranes.",
      "Suspend all lifts and confirm the limit on the appointed person's lift plan."
    );
  }
  if (c.gust && c.gust >= LIMITS.windLifting) {
    return caution(
      "Gusts to " + windKmh(c.gust) + " km/h can swing a suspended load.",
      "Limit lifts to compact loads and use tag lines on every pick."
    );
  }
  if (c.wind >= LIMITS.windAtHeight) {
    return caution(
      "Wind pressure on large-surface loads will cause load swing.",
      "Defer panels, formwork and sheeting picks, and brief the banksman."
    );
  }
  if (c.lowVisibility) {
    return caution(
      "Poor visibility between the operator and the landing zone.",
      "Use radio-guided lifts with a banksman at both ends."
    );
  }
  return fine();
}

function checkPainting(c) {
  if (c.storm || c.wet) {
    return stop(
      "Rain will streak and lift uncured coatings.",
      "Move painters to interior or covered areas today."
    );
  }
  if (c.humidity >= LIMITS.humidityHigh) {
    return stop(
      "At " + c.humidity + "% humidity most coatings will not cure properly.",
      "Wait for humidity below 85%, or run dehumidifiers in enclosed areas."
    );
  }
  if (c.humidity >= LIMITS.humidityWatch) {
    return caution(
      "Borderline humidity - expect longer recoat times.",
      "Extend drying times between coats and check the datasheet window."
    );
  }
  if (c.temp < 10) {
    return caution(
      "Below 10°C most paints thicken and cure slowly.",
      "Paint mid-morning onward, once surfaces have warmed."
    );
  }
  if (c.temp > 35) {
    return caution(
      "Hot substrates flash-dry the film and trap solvent.",
      "Follow the shade around the building and avoid midday application."
    );
  }
  return fine();
}

function checkExcavation(c) {
  if (c.storm || c.heavyRain) {
    return stop(
      "Saturated ground raises the risk of trench and batter collapse.",
      "Clear all operatives from open excavations and re-inspect supports before re-entry."
    );
  }
  if (c.wet) {
    return caution(
      "Wet ground means slippery haul roads and unstable faces.",
      "Run pumps in the excavation and re-inspect shoring before each shift."
    );
  }
  if (c.temp < LIMITS.tempFreeze) {
    return caution(
      "Frozen ground is hard to cut and thaws into an unstable face.",
      "Break ground later in the day and re-inspect faces after any thaw."
    );
  }
  return fine();
}

function checkWorkAtHeight(c) {
  if (c.storm) {
    return stop(
      "Lightning and squalls make elevated work unsafe.",
      "Bring everyone down and apply the 30-minute lightning rule."
    );
  }
  if (c.wind >= LIMITS.windLifting) {
    return stop(
      windKmh(c.wind) + " km/h exceeds safe working limits on scaffold and MEWPs.",
      "Close off the scaffold, remove debris netting loads, and tag it out."
    );
  }
  if (c.wind >= LIMITS.windAtHeight) {
    return caution(
      "Gusty conditions affect balance and material handling at height.",
      "Inspect ties and toe boards, and stop handling sheet materials aloft."
    );
  }
  if (c.wet || c.snow) {
    return caution(
      "Wet platforms and ladders are a slip hazard.",
      "Grit or squeegee platforms and brief on three points of contact."
    );
  }
  return fine();
}

function checkMasonry(c) {
  if (c.storm || c.heavyRain) {
    return stop(
      "Rain washes out fresh mortar joints.",
      "Cover new walls to two courses down and stop laying."
    );
  }
  if (c.temp < LIMITS.tempFreeze) {
    return stop(
      "Mortar will not gain strength and frost will damage the joints.",
      "Stop laying until temperatures rise, and protect existing work overnight."
    );
  }
  if (c.wet) {
    return caution(
      "Showers can stain and weaken green joints.",
      "Keep hessian and sheeting on the wall head between showers."
    );
  }
  if (c.temp < LIMITS.tempCold) {
    return caution(
      "Cold slows the set - joints stay vulnerable overnight.",
      "Use a mortar plasticiser and cover the wall head each evening."
    );
  }
  if (c.temp > 32) {
    return caution(
      "Heat dries mortar before it bonds to the block.",
      "Damp down blocks, mix smaller batches, and shade mortar boards."
    );
  }
  return fine();
}

function checkLabour(c) {
  if (c.storm) {
    return stop(
      "Lightning within striking distance of the site.",
      "Move everyone to hard shelter and account for all operatives."
    );
  }
  if (c.temp >= LIMITS.tempExtremeHeat) {
    return stop(
      Math.round(c.feelsLike) + "°C felt temperature is unsafe for sustained heavy work.",
      "Suspend heavy labour and move to light or indoor tasks."
    );
  }
  if (c.temp > LIMITS.tempHot) {
    return caution(
      "Feels like " + Math.round(c.feelsLike) + "°C - heat-stress risk for heavy tasks.",
      "Rotate crews, add shaded rest breaks, and keep drinking water at the work face."
    );
  }
  if (c.temp < LIMITS.tempFreeze) {
    return caution(
      "Cold-stress risk and reduced grip and dexterity.",
      "Provide a warm break area and issue cold-weather gloves."
    );
  }
  if (c.lowVisibility) {
    return caution(
      "Reduced visibility for plant and pedestrian movements.",
      "Enforce hi-vis, lower site speed limits, and use a banksman for reversing."
    );
  }
  if (c.wet) {
    return caution(
      "Wet access routes and standing water underfoot.",
      "Clear drainage on walkways and check temporary electrics for water ingress."
    );
  }
  return fine();
}

function buildTrade(name, icon, result) {
  return {
    name: name,
    icon: icon,
    status: result.status,
    note: result.note,
    action: result.action,
  };
}

function worstStatus(trades) {
  let worst = "go";

  trades.forEach(function (trade) {
    if (trade.status === "stop") {
      worst = "stop";
    } else if (trade.status === "caution" && worst === "go") {
      worst = "caution";
    }
  });

  return worst;
}

function collectActions(trades) {
  const actions = [];

  ["stop", "caution"].forEach(function (status) {
    trades.forEach(function (trade) {
      if (trade.status === status && trade.action && !actions.includes(trade.action)) {
        actions.push(trade.action);
      }
    });
  });

  return actions.slice(0, 5);
}

function writeHeadline(trades, siteStatus) {
  if (siteStatus === "go") {
    return "Full programme is viable today - conditions are inside working limits for every trade.";
  }

  if (siteStatus === "caution") {
    const careful = trades.filter(function (trade) {
      return trade.status === "caution";
    });
    return (
      "Work can continue with control measures on " +
      careful.length +
      " of " +
      trades.length +
      " trades."
    );
  }

  const stopped = trades.filter(function (trade) {
    return trade.status === "stop";
  });

  if (stopped.length > 3) {
    return (
      "Conditions are outside safe limits for " +
      stopped.length +
      " of " +
      trades.length +
      " trades - suspend outdoor works and switch to indoor or prep tasks."
    );
  }

  const names = stopped.map(function (trade) {
    return trade.name.toLowerCase();
  });

  return "Stand down " + names.join(" and ") + " and re-plan the shift around them.";
}

export function assessSite(weather) {
  const conditions = getConditions(weather);

  const trades = [
    buildTrade("Concrete pour & finishing", "🪣", checkConcrete(conditions)),
    buildTrade("Roofing & waterproofing", "🏠", checkRoofing(conditions)),
    buildTrade("Crane & lifting operations", "🏗", checkLifting(conditions)),
    buildTrade("Painting & coating", "🎨", checkPainting(conditions)),
    buildTrade("Excavation & earthworks", "⛏", checkExcavation(conditions)),
    buildTrade("Scaffolding & work at height", "🪜", checkWorkAtHeight(conditions)),
    buildTrade("Masonry & blockwork", "🧱", checkMasonry(conditions)),
    buildTrade("General site labour", "👷", checkLabour(conditions)),
  ];

  const siteStatus = worstStatus(trades);

  return {
    conditions: conditions,
    trades: trades,
    siteStatus: siteStatus,
    actions: collectActions(trades),
    headline: writeHeadline(trades, siteStatus),
  };
}

/* ---------------- The 5-day plan ---------------- */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nameTheDay(date, position) {
  if (position === 0) return "Today";
  if (position === 1) return "Tomorrow";
  return DAY_NAMES[date.getDay()];
}

function slotIsWorkable(slot) {
  return (
    !slot.storm &&
    !slot.heavyRain &&
    slot.rainChance < 0.5 &&
    slot.wind < LIMITS.windLifting &&
    slot.temp < LIMITS.tempExtremeHeat &&
    slot.temp > LIMITS.tempFreeze
  );
}


function scoreDay(day) {
  let score = 100;

  score = score - day.rainChance * 35;
  score = score - Math.min(day.rainMm * 4, 25);

  if (day.storm) score = score - 30;

  if (day.maxWind >= LIMITS.windGale) score = score - 40;
  else if (day.maxWind >= LIMITS.windLifting) score = score - 25;
  else if (day.maxWind >= LIMITS.windAtHeight) score = score - 10;

  if (day.maxTemp >= LIMITS.tempExtremeHeat) score = score - 25;
  else if (day.maxTemp > LIMITS.tempHot) score = score - 10;

  if (day.minTemp < LIMITS.tempFreeze) score = score - 25;
  else if (day.minTemp < LIMITS.tempCold) score = score - 10;

  if (score < 0) score = 0;

  return Math.round(score);
}

// One line of advice for the day.
function adviseDay(day) {
  if (day.workableHours === null) {
    return "Working hours are done - use the evening for prep and covers.";
  }
  if (day.storm) {
    return "Storm risk - plan indoor fit-out and prep work.";
  }
  if (day.maxWind >= LIMITS.windLifting) {
    return "Wind above lifting limits - move crane work off this day.";
  }
  if (day.rainChance >= 0.6 || day.rainMm > 2) {
    return "Wet day - defer pours, roofing and painting.";
  }
  if (day.maxTemp > LIMITS.tempHot) {
    return "Heat - run an early shift and plan extra hydration breaks.";
  }
  if (day.minTemp < LIMITS.tempCold) {
    return "Cold nights - protect fresh concrete and mortar overnight.";
  }
  if (day.rainChance >= 0.3) {
    return "Showers possible - keep covers on standby for open works.";
  }
  return "Good window - schedule pours, roofing and lifts.";
}


export function summariseDays(forecastList) {
  const grouped = [];

  forecastList.forEach(function (reading) {
    const date = reading.dt_txt.slice(0, 10);
    const hour = Number(reading.dt_txt.slice(11, 13));

    let group = grouped.find(function (item) {
      return item.date === date;
    });

    if (!group) {
      group = { date: date, slots: [] };
      grouped.push(group);
    }

    const slot = getConditions(reading);
    slot.hour = hour;
    group.slots.push(slot);
  });

  const days = [];

  grouped.slice(0, 5).forEach(function (group, position) {
    const slots = group.slots;

    let maxTemp = slots[0].temp;
    let minTemp = slots[0].temp;
    let maxWind = 0;
    let rainChance = 0;
    let rainMm = 0;
    let storm = false;
    let daytimeSlots = 0;
    let workableSlots = 0;

    slots.forEach(function (slot) {
      if (slot.temp > maxTemp) maxTemp = slot.temp;
      if (slot.temp < minTemp) minTemp = slot.temp;
      if (slot.wind > maxWind) maxWind = slot.wind;
      if (slot.rainChance > rainChance) rainChance = slot.rainChance;
      if (slot.storm) storm = true;
      rainMm = rainMm + slot.rainMm;

      if (slot.hour >= 6 && slot.hour < 18) {
        daytimeSlots = daytimeSlots + 1;
        if (slotIsWorkable(slot)) workableSlots = workableSlots + 1;
      }
    });

    const workableHours = daytimeSlots > 0 ? workableSlots * 3 : null;

    const date = new Date(group.date + "T12:00:00");

    const day = {
      date: group.date,
      label: nameTheDay(date, position),
      dateText: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      maxTemp: maxTemp,
      minTemp: minTemp,
      maxWind: maxWind,
      rainChance: rainChance,
      rainMm: rainMm,
      storm: storm,
      workableHours: workableHours,
    };

    day.score = scoreDay(day);
    day.rating = day.score >= 75 ? "go" : day.score >= 45 ? "caution" : "stop";
    day.guidance = adviseDay(day);

    days.push(day);
  });

  return days;
}

export function planningTip(days) {
  const usable = days.filter(function (day) {
    return day.workableHours !== null;
  });

  if (usable.length === 0) return "";

  let best = usable[0];
  let worst = usable[0];

  usable.forEach(function (day) {
    if (day.score > best.score) best = day;
    if (day.score < worst.score) worst = day;
  });

  if (best.score < 45) {
    return "No clear weather window in the next 5 days - bring forward indoor fit-out, snagging and off-site fabrication.";
  }

  let tip =
    "Best window: " +
    best.label +
    " (" +
    best.score +
    "% workable) - book weather-critical works such as pours, roofing and major lifts then.";

  if (worst.score < 45 && worst.date !== best.date) {
    tip = tip + " Keep " + worst.label + " for indoor works and plant maintenance.";
  }

  return tip;
}
