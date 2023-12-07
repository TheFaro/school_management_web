import { Component, ElementRef, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  _observed = new Subject<Element>();
  _observer = new window.IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      this._observed.next(entry.target);
    }
  }, { root: null, threshold: 0.9 });

  @Input() type: 'info' | 'warning' | 'error' = 'info';
  @Input() dismissable = false;

  @Output() dismissed = new Subject();
  @Output() observed = this._observed;

  constructor(
    private readonly ref: ElementRef
  ) {
    setTimeout(() => {
      this._observer.observe(this.ref.nativeElement);
    }, 4000);
  }
}