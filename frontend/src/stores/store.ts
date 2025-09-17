import { configureStore } from '@reduxjs/toolkit';
import styleReducer from './styleSlice';
import mainReducer from './mainSlice';
import authSlice from './authSlice';

import usersSlice from "./users/usersSlice";
import attendance_eventsSlice from "./attendance_events/attendance_eventsSlice";
import classroomsSlice from "./classrooms/classroomsSlice";
import leave_requestsSlice from "./leave_requests/leave_requestsSlice";
import student_classesSlice from "./student_classes/student_classesSlice";

export const store = configureStore({
  reducer: {
    style: styleReducer,
    main: mainReducer,
    auth: authSlice,

users: usersSlice,
attendance_events: attendance_eventsSlice,
classrooms: classroomsSlice,
leave_requests: leave_requestsSlice,
student_classes: student_classesSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
