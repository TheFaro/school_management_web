import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { ISubjects } from 'src/app/shared/add-subjects/add-subjects.interface';
import { AddSubjectsService } from 'src/app/shared/add-subjects/add-subjects.service';
import {
  addSubjectsPaginatorOptions,
  deleteSubjectRequest,
  getSubjectsError,
  subjectsIsLoading,
} from 'src/app/store/subjects/subjects.actions';
import {
  selectSubjectsArray,
  selectSubjectsIsLoading,
  selectSubjectsPaginatorOptions,
} from 'src/app/store/subjects/subjects.selector';
import { AddSubjectsComponent } from '../add-subjects.component';
import { DialogConfirmSubjectDeleteComponent } from '../dialog-confirm-subject-delete/dialog-confirm-subject-delete.component';

interface SUBJECT {
  department_id: string;
  department_name: string;
  subject: string;
  level: string;
  _id: string;
  index: string;
  pass_mark: number;
}

@UntilDestroy()
@Component({
  selector: 'app-view-subjects-table',
  templateUrl: './view-subjects-table.component.html',
  styleUrls: ['./view-subjects-table.component.scss'],
})
export class ViewSubjectsTableComponent implements AfterViewInit, OnInit {
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [1, 3, 5, 10, 25, 100];

  displayedColumns: string[] = [
    'index',
    'department',
    'subject',
    'level',
    'pass_mark',
    'actions',
  ];
  dataSource: MatTableDataSource<SUBJECT> = new MatTableDataSource();
  onOpenDialog = new EventEmitter();
  dialogRef: any;
  subjects$ = this.store.select(selectSubjectsArray);
  isLoading$ = this.store.select(selectSubjectsIsLoading);
  paginator$ = this.store.select(selectSubjectsPaginatorOptions);

  constructor(
    private api: AddSubjectsService,
    public dialog: MatDialog,
    private store: Store
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    // load initial data
    this.loadData();
  }

  dispatchSubjectsIsLoading(state: boolean) {
    this.store.dispatch(subjectsIsLoading({ subjectsIsLoading: state }));
  }

  loadData() {
    this.dispatchSubjectsIsLoading(true);
    this.subjects$.subscribe((data: ISubjects[]) => {
      console.log('running from subjects subscribe');
      if (data.length) {

        const arr: SUBJECT[] = [];

        for (let i = 0; i < data.length; i++) {
          console.log(`This is data: ${data[i]}`);
          arr.push({
            index: `${i + 1}`,
            _id: data[i]._id || '',
            subject: data[i].name,
            level: data[i].level,
            pass_mark: data[i].pass_mark,
            department_id: data[i].department_id._id || '',
            department_name: data[i].department_id.name,
          });
        }
        this.dataSource.data = arr;
        this.dispatchSubjectsIsLoading(false);
      }
    });

    this.paginator$.pipe(untilDestroyed(this)).subscribe({
      next: (data) => {
        this.paginator.pageIndex = data.currentPage;
        this.paginator.length = data.count;
      },
      error: (err) => {
        this.store.dispatch(getSubjectsError({ message: err }));
      },
    });
  }

  deleteRow(data: any) {
    console.log(data);
    this.dispatchSubjectsIsLoading(true);
    this.store.dispatch(deleteSubjectRequest({ id: data._id }));
    // this.api.deleteSubject(data._id).subscribe({
    //   next: (res: any) => {
    //     console.log(res);
    //     setTimeout(() => {
    //       this.loadData();
    //     }, 1000);
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
  }

  pageChanged(event: PageEvent) {
    console.log({ event });
    this.store.dispatch(
      addSubjectsPaginatorOptions({
        paginator: {
          pageSize: event.pageSize,
          currentPage: event.pageIndex,
          count: 0,
        },
      })
    );
    // this.pageSize = event.pageSize;
    // this.currentPage = event.pageIndex;
    this.loadData();
  }

  openDialog(component: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.closeOnNavigation = true;
    dialogConfig.width = '45%';
    dialogConfig.height = '80%';

    if (component == 'AddSubjectComponent') {
      this.dialogRef = this.dialog.open(AddSubjectsComponent, dialogConfig);
      const instance = this.dialogRef.componentInstance;

      instance.onClose.subscribe(() => {
        this.dialogRef.close();
      });

      instance.onSubmit.subscribe(() => {
        instance.addSubjects();
        setTimeout(() => {
          this.loadData();
        }, 1000);
      });

      this.dialogRef.afterClosed().subscribe(() => {
        console.log(`Dialog result (View Subjects Table) ${instance.elements}`);
      });
    }
  }

  // TODO: finish up update dialog and API call
  openUpdateDialog(subject: any) {
    console.log(subject);
  }

  openDeleteDialog(subject: any) {
    console.log(subject);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Confirm subject deletion',
      subject: subject.subject,
    };

    const dialog = this.dialog.open(
      DialogConfirmSubjectDeleteComponent,
      dialogConfig
    );
    const instance = dialog.componentInstance;

    instance.onCloseDialog.subscribe(() => {
      dialog.close();
    });

    instance.onConfirmDelete.subscribe(() => {
      this.deleteRow(subject);
      dialog.close();
    });
  }
}
