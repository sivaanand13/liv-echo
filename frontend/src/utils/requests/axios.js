import axios from "axios";
const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const url = (endpoint) => {
  return BACKEND_URI + endpoint;
};

export const get = async (endpoint, queryParams = {}) => {
  try {
    const { status, data } = await axios.get(url(endpoint), {
      params: queryParams,
    });
    return {
      status,
      data,
    };
  } catch (e) {
    console.log(`GET request failed for ${url(endpoint)}`, queryParams, e);
    throw {
      status: e.response ? e.response.status : null,
      data: e.response ? e.response.data : null,
    };
  }
};

export const post = async (endpoint, body = {}) => {
  try {
    const { status, data } = await axios.post(url(endpoint), body);
    return {
      status,
      data,
    };
  } catch (e) {
    console.log(`POST request failed for ${url(endpoint)}`, body, e);
    throw {
      status: e.response ? e.response.status : null,
      data: e.response ? e.response.data : null,
    };
  }
};

export default {
  get,
  post,
};
