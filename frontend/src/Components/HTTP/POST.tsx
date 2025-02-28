import axios, { AxiosError, AxiosResponse } from "axios";
import {
  useMutation,
  UseMutationResult,
  MutationFunction,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Define types for request and response data
interface RequestData {
  [key: string]: any;
}

interface ParamsType {
  headers?: Record<string, string>;
  onSuccess?: (data: AxiosResponse<Response>) => void;
  onError?: (error: AxiosError) => void;
  retry?: number;
}

// Define the POST function
const postData = async ({
  endpoint,
  data,
  headers,
}: {
  endpoint: string;
  data: RequestData;
  headers?: Record<string, string>;
}): Promise<AxiosResponse<Response>> => {
  const config = headers ? { headers } : {};
  const response = await axios.post<Response>(endpoint, data, config);
  return response;
};

// Custom hook to handle POST requests
const usePostData = ({
  endpoint,
  params,
}: {
  endpoint: string;
  params: ParamsType;
}): UseMutationResult<AxiosResponse<Response>, AxiosError, RequestData> => {
  return useMutation<AxiosResponse<Response>, AxiosError, RequestData>({
    mutationFn: (data) =>
      postData({
        endpoint,
        data,
        headers: params.headers ?? {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    onSuccess:
      params.onSuccess ?? (() => toast.success("Data posted successfully")),
    onError:
      params.onError ??
      ((error: AxiosError) => {
        if (error.response) {
          const { message, errors } = error.response.data;

          if (message && errors?.error) {
            const errorMessage = errors.error.join(", ") || message;
            toast.error(errorMessage);
          } else {
            toast.error(message || "An unknown error occurred.");
          }
        }
        // else {
        //   toast.error("Network error occurred");
        // }
      }),

    retry: params.retry ?? 0,
    onSettled: (data) => {
      console.log(data);
    },
  });
};

export { usePostData };
