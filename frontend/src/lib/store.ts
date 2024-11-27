import { configureStore } from "@reduxjs/toolkit";
import reposReducer from "./features/reposSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      repos: reposReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore specific paths or actions related to non-serializable data
          ignoredPaths: ['repos.repos.daoOwner'], // You can specify paths that should be ignored
          ignoredActions: ['GET_ALL_REPOS/fulfilled'], // You can also specify actions
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
