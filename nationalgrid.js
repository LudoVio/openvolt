async function get(url) {
  const res = await fetch(url);

  if (res.status < 200 || res.status >= 300) {
    console.log(await res.json());
    throw new Error(
      `National Grid: Get request failed with status ${res.status}`
    );
  }

  return res.json();
}

module.exports = {
  intensity: {
    get(from, to) {
      return get(`https://api.carbonintensity.org.uk/intensity/${from}/${to}`);
    },
  },

  generation: {
    get(from, to) {
      return get(`https://api.carbonintensity.org.uk/generation/${from}/${to}`);
    },
  },
};
