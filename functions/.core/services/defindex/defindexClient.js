const { default: axios } = require("axios");

class DeFindexClient {
  constructor() {
    if (!process.env.DEFINDEX_API_URL) {
      throw new Error("Url for defindex not defined.")
    }
    if (!process.env.DEFINDEX_USER) {
      throw new Error("Username for defindex not defined.")
    }
    if (!process.env.DEFINDEX_PASSWORD) {
      throw new Error("Password for defindex not defined.")
    }
    if (!process.env.DEFINDEX_VAULT_ADDRESS) {
      throw new Error("Vault address not defined.")
    }
    if (!process.env.DEFINDEX_STELLAR_NETWORK) {
      throw new Error("Stellar network for vault not defined.");
    }
    this.client = axios.create({
      baseURL: process.env.DEFINDEX_API_URL,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    })
    this.vault = process.env.DEFINDEX_VAULT_ADDRESS;
    this.network = process.env.DEFINDEX_STELLAR_NETWORK;
  }

  async #getAccessToken() {
    
    const response = await this.client.post("/login", {
      email: process.env.DEFINDEX_USER,
      password: process.env.DEFINDEX_PASSWORD,
    })
    if (response.status !== 200) {
        throw new Error("Login to defindex failed");
    }
    const {access_token} = response.data;
    return access_token;
  }

  async send(xdr) {
    try {
      const response = await this.client.post(`/send?network=${this.network}`,
        {
          xdr: xdr,
          launchtube: true
        },
        {
          headers: {
            "Authorization": `Bearer ${await this.#getAccessToken()}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          }
        }
      );
      console.log(response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error("Error de la API:", err.response.data);
        throw new Error(`API Error: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error("No se recibió respuesta del servidor:", err.request);
        throw new Error("No response received from server");
      } else {
        console.error("Error desconocido:", err.message);
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.client.post(`/vault/${this.vault}/${endpoint}?network=${this.network}`, data, {
        headers: {
          "Authorization": `Bearer ${await this.#getAccessToken()}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      })
      console.log(response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error("Error de la API:", err.response.data);
        throw new Error(`API Error: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error("No se recibió respuesta del servidor:", err.request);
        throw new Error("No response received from server");
      } else {
        console.error("Error desconocido:", err.message);
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
}


  async get(endpoint, params) {
    try {
      const url = params ?
        `/vault/${this.vault}/${endpoint}?${new URLSearchParams(params).toString()}&network=${this.network}` :
        `/vault/${this.vault}/${endpoint}?network=${this.network}`;
      const response = await this.client.get(url, {
        headers: {
          "Authorization": `Bearer ${await this.#getAccessToken()}`,
        },
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error("Error de la API:", err.response.data);
        throw new Error(`API Error: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error("No se recibió respuesta del servidor:", err.request);
        throw new Error("No response received from server");
      } else {
        console.error("Error desconocido:", err.message);
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  }
};

exports.DeFindexClient = DeFindexClient;
