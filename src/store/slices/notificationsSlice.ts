import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";

import { sendNotification } from "../thunks/sendNotification";

export interface INotification {
  id?: number;
  type: "success" | "error" | "info";
  title?: string;
  description?: string;
  dismissAfter?: number;
}

export interface NotificationsState {
  list: INotification[];
}

const initialState: NotificationsState = {
  list: [],
}

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    dismissNotification: (
      state: Draft<typeof initialState>,
      action: PayloadAction<number>
    ) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendNotification.fulfilled, (state, action) => {
      if (action.payload) {
        state.list.push(action.payload);
      }
    })
  }
});

export const { dismissNotification, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.list;