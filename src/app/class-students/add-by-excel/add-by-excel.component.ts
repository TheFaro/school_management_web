import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClassStudentsService } from 'src/app/shared/class-students/class-students.service';
import * as XLSX from 'xlsx';

interface STUDENT {
  stream: string;
  name: string;
  surname: string;
  gender: string;
  contact: string;
  year: string;
}

@Component({
  selector: 'app-add-by-excel',
  templateUrl: './add-by-excel.component.html',
  styleUrls: ['./add-by-excel.component.scss'],
})
export class AddByExcelComponent {
  constructor(private service: ClassStudentsService, private router: Router) {}

  file?: File;
  arrayBuffer: any;
  filelist: any;
  isFileSelected = false;
  isCheckedList: boolean[] = [];
  sheets: any[] = [];
  selectedSheets: any[] = [];
  workbook: any;

  displayedColumns = [
    'No',
    'SURNAME',
    'FIRSTNAME',
    'GENDER',
    'CONTACT',
    'YEAR',
  ];

  addFile(event: any) {
    this.sheets = [];
    this.isFileSelected = true;
    this.file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.file!);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();

      for (var i = 0; i != data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }

      var bstr = arr.join('');
      this.workbook = XLSX.read(bstr, { type: 'binary' });
      this.workbook.SheetNames.forEach(() => {
        this.isCheckedList.push(false);
      });
      this.sheets = this.workbook.SheetNames;
      // console.table(workbook);
    };
  }

  confirmStudentsSheets() {
    // console.log(this.isCheckedList);
    // console.log(
    //   XLSX.utils.sheet_to_json(
    //     this.workbook.Sheets[this.workbook.SheetNames[1]],
    //     { raw: true }
    //   )
    // );

    this.selectedSheets = [];
    for (let i = 0; i < this.isCheckedList.length; i++) {
      if (this.isCheckedList[i]) {
        this.selectedSheets.push({
          class: this.workbook.SheetNames[i],
          // students: XLSX.utils.sheet_to_json(
          //   this.workbook.Sheets[this.workbook.SheetNames[1]],
          //   { raw: true }
          // ),
          dataSource: (new MatTableDataSource<STUDENT>().data =
            XLSX.utils.sheet_to_json(
              this.workbook.Sheets[this.workbook.SheetNames[i]],
              { raw: true }
            )),
        });
      }
    }

    // console.log(this.selectedSheets);
  }

  restructureSelectedClasses(): any[] {
    let classList = [];
    let streamsArr = JSON.parse(sessionStorage.getItem('streams')!);
    let serverList: {
      class_id: string;
      name: string;
      surname: string;
      year: string;
      gender: string;
      student_contact: string;
    }[] = [];

    // streamsArr.forEach((el: { _id: string; name: string }) => {
    //   if (el.name == 'Form 1A') {
    //     console.table(el);
    //   }
    // });

    this.selectedSheets.forEach((item) => {
      let classId = '';
      streamsArr.forEach((el: { _id: string; name: string }) => {
        if (el.name === item.class) {
          classId = el._id;
        }
      });

      item.dataSource.forEach((learners: any) => {
        console.log(learners);

        if (learners.FULLNAME != '') {
          serverList.push({
            class_id: classId,
            name: learners.FIRSTNAME,
            surname: learners.SURNAME,
            year:
              learners.YEAR == undefined
                ? new Date().getFullYear().toString()
                : learners.YEAR,
            gender:
              learners.GENDER == undefined
                ? ''
                : learners.GENDER == 'M' || learners.GENDER == 'Male'
                ? 'Male'
                : 'Female',
            student_contact:
              learners.CONTACT == undefined ? '' : learners.CONTACT,
          });
        }
      });
    });
    console.log(serverList);
    return serverList;
  }

  saveStudentsInDB() {
    let studentsList = this.restructureSelectedClasses();
    this.service.postStudentArray(studentsList).subscribe({
      next: (data: any) => {
        console.log(data);
        this.service.successToast(data.message);
        this.router.navigateByUrl('dashboard/academics');
      },
      error: (error) => {
        console.log(error);
        this.service.errorToast(error.toString());
      },
    });
  }
}
