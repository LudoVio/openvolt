class Client {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async get(url, params) {
    const res = await fetch(url + "?" + new URLSearchParams(params), {
      headers: { "X-Api-Key": this.apiKey },
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Get request failed with status ${res.status}`);
    }

    return res.json();
  }
}

class IntervalData {
  url = "https://api.openvolt.com/v1/interval-data";

  constructor(client) {
    this.client = client;
  }

  get(params) {
    return this.client.get(this.url, params);
  }
}

module.exports = (apiKey) => {
  const client = new Client(apiKey);

  return {
    interval_data: new IntervalData(client),
  };
};
