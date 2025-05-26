import axios from 'axios';
import {supabase} from "@/utils/supabase";

const apiClient = axios.create();

apiClient.interceptors.request.use(
    async (config) => {
        config.headers = config.headers || {};

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            console.log("Axios request interceptor: Checking Supabase session...")

            if (sessionError) {
                console.warn(
                    "Supabase: Error fetching session, request will proceed without auth header:",
                    sessionError.message
                );
            } else if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
                console.log("Supabase: Access token found, adding to request headers:", session.access_token);
                config.headers["refresh-token"] = session.refresh_token;
                console.log("Supabase: Refresh token found, adding to request headers:", session.refresh_token);

            } else {
                console.warn(
                    "Supabase: No active session or access token found, request will proceed without auth header."
                );
            }

        } catch (e) {
            console.error(
                "Axios Interceptor: Unexpected error trying to get Supabase session, request will proceed without auth header:",
                e
            );
        }

        return config;
    },
    (error) => {
        console.error("Axios request interceptor error (before session check):", error);
        return Promise.reject(error);
    }
);

export default apiClient;