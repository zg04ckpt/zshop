import axios, { Axios, AxiosError, AxiosInstance } from "axios";
import { ApiResult } from "../model/api-result.model";
import { useNavigate } from "react-router-dom";
import React from "react";

// instance for other api providers
export const api = axios.create();

// instance for server api
export const serverApi = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// config server api interceptor
serverApi.interceptors.request.use(
    config => {
        return config;
    }
);