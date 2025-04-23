import axios from "axios";
import { getAuth } from "firebase/auth";

let BACKEND_URI;
if (import.meta.env.VITE_ENV_TYPE == "dev") {
  BACKEND_URI = import.meta.env.VITE_BACKEND_URI_DEV;
} else {
  BACKEND_URI = import.meta.env.VITE_BACKEND_URI_PROD;
}

const url = (endpoint) => {
  return BACKEND_URI + endpoint;
};

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const authToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const get = async (endpoint, queryParams = {}) => {
  try {
    const { status, data } = await axiosInstance.get(url(endpoint), {
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
    const { status, data } = await axiosInstance.post(url(endpoint), body);
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

export const patch = async (endpoint, body = {}) => {
  try {
    const { status, data } = await axiosInstance.patch(url(endpoint), body);
    return {
      status,
      data,
    };
  } catch (e) {
    console.log(`PATCH request failed for ${url(endpoint)}`, body, e);
    throw {
      status: e.response ? e.response.status : null,
      data: e.response ? e.response.data : null,
    };
  }
};

export const del = async (endpoint, body = {}) => {
  try {
    const { status, data } = await axiosInstance.delete(url(endpoint), body);
    return {
      status,
      data,
    };
  } catch (e) {
    console.log(`DELETE request failed for ${url(endpoint)}`, body, e);
    throw {
      status: e.response ? e.response.status : null,
      data: e.response ? e.response.data : null,
    };
  }
};

export const uploadAttachments = async (files) => {
  const body = new FormData();
  if (!Array.isArray(files)) {
    files = [files];
  }
  for (const file of files) {
    body.append("attachments", file);
  }

  const response = await post("users/upload-attachments", body);
  return response.data;
};

export default {
  get,
  post,
  patch,
  del,
  uploadAttachments,
};
