import { Component, HostBinding } from '@angular/core';
import { selectDashboardMenu } from '../../store/dashboard.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent {
  // we define a few binding properties for the ui
  @HostBinding('class.toggle')
  expanded = false;

  title = 'School Management System';

  // we define the menu sections, we will illustrate each section
  sections$ = this.store.select(selectDashboardMenu);

  constructor(
    private readonly store: Store
  ) {
    this.expanded = window.innerWidth < 900;
  }
}