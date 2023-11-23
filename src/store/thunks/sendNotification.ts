"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";

import { INotification, dismissNotification } from './../slices/notificationsSlice';

export const sendNotification = createAsyncThunk("sendNotification", async (notificationObject: INotification, { dispatch }) => {

    const id = new Date().getTime();

    setTimeout(() => {
      dispatch(dismissNotification(id));
    }, notificationObject.dismissAfter || 3000);

    return ({
      id,
      ...notificationObject,
    });
});