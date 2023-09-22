import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { selectAppUser } from 'src/app/store/app.selectors';
import { toolbarLogoutClick } from '../../store/dashboard.actions';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  loader$ = this.router.events.pipe(
    filter(
      (event) =>
        event instanceof RouteConfigLoadStart ||
        event instanceof RouteConfigLoadEnd
    ),
    map((event) => event instanceof RouteConfigLoadStart)
  );
  crumb$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    distinctUntilChanged(),
    map(() => this.render(this.activated.root))
  );
  user$ = this.store.select(selectAppUser);

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly activated: ActivatedRoute
  ) {}

  logout() {
    this.store.dispatch(toolbarLogoutClick());
  }

  // we define a function that will format the route event into something that can be used to render a chip list
  private render(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: Array<BreadCrumb> = [{ label: 'Home', url: '../' }]
  ): Array<BreadCrumb> {
    const label = route.routeConfig?.data?.['breadcrumb'];

    const path = route.routeConfig ? route.routeConfig.path : '';
    // In the routeConfig the complete path is not available,
    // so we rebuild it each time
    const nextUrl = `${url}${path}`;
    const breadcrumb = {
      label: label,
      url: nextUrl,
    };
    // we copy the bread crumbs
    const newcrumbs = [...breadcrumbs];
    // so if the new url is empty the we push it to the new crumbs to send over
    if (nextUrl.length > 0 && label) {
      newcrumbs.push(breadcrumb);
    }

    if (route.firstChild) {
      // If we are not on our current path yet,
      // there will be more children to look after, to build our breadcumb
      return this.render(route.firstChild, nextUrl, newcrumbs);
    }
    return newcrumbs;
  }
}

interface BreadCrumb {
  label: string;
  url: string;
}
