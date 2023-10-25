const API_KEY = "test-Z9EB05N-07FMA5B-PYFEE46-X4ECYAR";
const METER_ID = "6514167223e3d1424bf82742";
const FROM = "2023-01-01";
const TO = "2023-01-31";

const openvolt = require("./openvolt.js")(API_KEY);
const nationalgrid = require("./nationalgrid.js");

async function solution() {
  console.log(`from ${FROM} to ${TO}`);

  const openvoltResponse = await openvolt.interval_data.get({
    meter_id: METER_ID,
    granularity: "hh",
    start_date: FROM,
    end_date: TO,
  });

  // Remove last item as it is for the interval after the end date
  openvoltResponse.data.pop();

  const totalConsumption = openvoltResponse.data.reduce(
    (acc, d) => acc + parseInt(d.consumption),
    0
  );

  console.log(`Energy consumed: ${totalConsumption} kWh`);

  const intensityResponse = await nationalgrid.intensity.get(FROM, TO);

  // Remove first item as it is for the interval before the start date
  intensityResponse.data.shift();

  let co2Emitted = 0;

  for (let i = 0; i < intensityResponse.data.length; i++) {
    const intensity = intensityResponse.data[i].intensity.actual;
    const kwh = openvoltResponse.data[i].consumption;

    // Intensity is in g of Co2 per kwh. We want the unit to be kg
    co2Emitted += (intensity * kwh) / 1000;
  }

  console.log(`CO2 emitted: ${co2Emitted.toFixed(2)} kgs`);

  const generationResponse = await nationalgrid.generation.get(FROM, TO);

  // Remove first item as it is for the interval before the start date
  generationResponse.data.shift();

  const consumptionPerFuel = {};

  for (let i = 0; i < generationResponse.data.length; i++) {
    const generation = generationResponse.data[i].generationmix;
    const kwh = openvoltResponse.data[i].consumption;

    for (let j = 0; j < generation.length; j++) {
      const { fuel, perc } = generation[j];

      if (!consumptionPerFuel[fuel]) {
        consumptionPerFuel[fuel] = 0;
      }

      consumptionPerFuel[fuel] += (perc * kwh) / 100;
    }
  }

  const totalConsumptionPerFuel = Object.values(consumptionPerFuel).reduce(
    (acc, v) => acc + v,
    0
  );

  console.log("Consumption per fuel:");

  for (const fuel in consumptionPerFuel) {
    const co2 = consumptionPerFuel[fuel];
    const perc = (co2 / totalConsumptionPerFuel) * 100;
    console.log(`${fuel}: ${perc.toFixed(2)}% (${co2.toFixed(2)} kwh)`);
  }
}

solution();
