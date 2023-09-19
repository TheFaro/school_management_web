import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, mergeMap, of, switchMap } from 'rxjs';
import {
  addSchoolInfo,
  checkModulesError,
  checkModulesRequest,
  isSchoolInfoLoading,
} from './school-info.actions';
import { UserService } from 'src/app/modules/authenticate/services/user/user.service';

@Injectable()
export class SchoolInfoEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly schoolInfoService: UserService,
    private readonly router: Router
  ) {}
  // get the school info data
  getSchoolInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(checkModulesRequest),
      mergeMap(({ _id }) =>
        from(this.schoolInfoService.modules(_id)).pipe(
          catchError((error) => {
            return of(
              checkModulesError({ message: error.toString() })
            );
          })
        )
      ),
      switchMap((success: any) => {
        const modulesRes = success;
        if (
          modulesRes.missing.length &&
          modulesRes.missing[0].name === 'school-info'
        ) {
          this.navigateToSchoolRegistration();
          return of(
            isSchoolInfoLoading({ isSchoolInfoLoading: false }),
            checkModulesError({ message: 'School info not found' })
          );
        } else if(modulesRes.success === 100) {
          this.navigateToDashboard();
          return of(
            isSchoolInfoLoading({ isSchoolInfoLoading: false }),
            addSchoolInfo({ school_info: modulesRes.data })
          );
        }

        return of(isSchoolInfoLoading({isSchoolInfoLoading: false}));
      })
    );
  });

  // function to navigate to navigate to dashboard
  navigateToDashboard() {
    this.router.navigate(['/dashboard/academics']);
  }

  // function to navigate to school registration
  navigateToSchoolRegistration() {
    this.router.navigate(['/school-registration']);
  }
}
