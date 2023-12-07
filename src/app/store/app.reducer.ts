import { createReducer, on } from '@ngrx/store';
import { AppState, initial } from './app.state';
import {
  appInitializedEffect,
  loadNotificationsEffectSuccessful,
  loadPermissionEffectSuccess,
  loadSchoolsEffectSuccessful,
  updateAppSchoolEffect,
  userAppLanding,
  userLandingEffectSuccessful,
} from './app.actions';
import {
  loginEffectSuccessful,
  registerEffectSuccessful,
} from '../modules/authenticate/store/authenticate.actions';
import { clickDismissDashboardBanner, toolbarLogoutClick } from '../modules/dashboard/store/dashboard.actions';
import { marknotification } from '../utilities/notification.utilities';
import { ISchool } from '../interfaces/school.interface';

export const key = 'app';

export const reducer = createReducer(
  initial,
  on(
    userAppLanding,
    (state): AppState => ({
      ...state,
      loading: true,
    })
  ),
  on(
    appInitializedEffect,
    (state): AppState => ({
      ...state,
      loading: false,
    })
  ),
  on(
    userLandingEffectSuccessful,
    loginEffectSuccessful,
    registerEffectSuccessful,
    (state, { user }): AppState => ({
      ...state,
      user,
    })
  ),

  on(
    toolbarLogoutClick,
    (state): AppState => ({
      ...state,
      user: undefined,
    })
  ),
  on(
    loadPermissionEffectSuccess,
    (state, action): AppState => ({
      ...state,
      permissions: action.permissions,
    })
  ),

  on(
    loadSchoolsEffectSuccessful,
    (state, action): AppState => ({
      ...state,
      schools: action.schools,
    })
  ),

  on(
    loadNotificationsEffectSuccessful,
    (state, action): AppState => ({
      ...state,
      notifications: action.notifications
    })
  ),

  on(
    clickDismissDashboardBanner,
    (state, action): AppState => ({
      ...state,
      notifications: marknotification(state.notifications, action.notification)
    })
  ),
  on(
    updateAppSchoolEffect,
    (state, action): AppState => ({
      ...state,
      schools: updateschool(state.schools, action.school)
    })
  )
);

function updateschool(schools: ISchool[], school: ISchool) {
  return schools.map((s) => {
    if (s.id === school.id) {
      return school;
    }
    return s;
  });
}