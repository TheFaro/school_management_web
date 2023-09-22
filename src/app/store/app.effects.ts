import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { userAppLanding, userLandingEffectSuccessful } from './app.actions';
import { AppService } from '../services/app.service';
import { filter, map } from 'rxjs/operators';
import { IUser } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { loginEffectSuccessful, registerEffectSuccessful } from '../modules/authenticate/store/authenticate.actions';
import { toolbarLogoutClick } from '../modules/dashboard/store/dashboard.actions';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,

    private router: Router,
    private service: AppService,
  ) {}

  landing$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userAppLanding),
      map(() => this.service.loaduser()),
      filter((u) => !!u),
      map((user) => userLandingEffectSuccessful({ user: user as IUser }))
    )
  });

  dashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        userLandingEffectSuccessful,
        loginEffectSuccessful,
        registerEffectSuccessful
      ),
      map(() => this.router.navigate(['dashboard']))
    )
  }, { dispatch: false });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(toolbarLogoutClick),
      map(() => {
        this.service.logout();
        this.router.navigate(['/'])
      }),
    )
  }, { dispatch: false });
}
