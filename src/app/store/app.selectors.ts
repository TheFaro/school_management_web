import { createFeatureSelector, createSelector } from '@ngrx/store';
import { key } from './app.reducer';
import { AppState } from './app.state';

const selectAppState = createFeatureSelector<AppState>(key);

export const selectAppUser = createSelector(
  selectAppState,
  (state) => state.user
);