import { configureStore } from "@reduxjs/toolkit"
// import walletReduder from "./features/walletSlice";
import reposReducer from "./features/reposSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            // connectedWallet: walletReduder,
            repos: reposReducer,
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']