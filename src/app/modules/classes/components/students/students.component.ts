import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { selectClassAPIError, selectClassAPILoading } from '../../store/classes.selectors';
import { IClass } from 'src/app/interfaces/class.interface';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent implements AfterViewInit {
  @Input() class?: IClass;

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  columns = ['avatar', 'name', 'contact'];
  data = new MatTableDataSource(this.students);

  loading$ = this.store.select(selectClassAPILoading);
  error$ = this.store.select(selectClassAPIError);

  get students() {
    return this.class?.students ?? []
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly store: Store
  ) {}

  ngAfterViewInit() {
    this.data.data = this.students!;
    this.data.paginator = this.paginator!;

    this.cdr.detectChanges();
  }
}