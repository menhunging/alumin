import { api } from "./axios";

export const test = async () => {
  try {
    const response = await api.get("/test");

    console.log(JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};
