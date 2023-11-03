import { Component, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiHandlerService } from '@linkqsjsc/api-handler';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import * as _ from 'lodash';
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSliderModule } from '@angular/material/slider';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NofiticationComponent } from '../nofitication/nofitication.component';
import { DataService } from '../data-service.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  mst: string;
  surveyId: string;
  dataQuesion = signal<any>([]);
  stepperOrientation: 'horizontal' | 'vertical' = 'horizontal';
  private baseUrl: string = 'https://10.10.0.2:7065/api';
  model: any = {};
  text: any = {};
  isLoading = signal(false);
  selectedAnswer!: string;
  surveyResult: any = [];
  note: any = {};
  formInfoCustomer!: FormGroup;
  showSurvey = signal(true);
  title =
    'Hãy chia sẻ ý kiến của bạn về trải nghiệm sử dụng phần mềm ERP của chúng tôi';
  // form!: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private _apiHandler: ApiHandlerService,
    private _http: HttpClient,
    private _destroyRef: DestroyRef,
    private fb: FormBuilder,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _dataService: DataService
  ) {
    this.mst = this.route.snapshot.paramMap.get('mst') as string;
    this.surveyId = this.route.snapshot.paramMap.get('id-survey') as string;
    this.formInfoCustomer = this.fb.group({
      Name: ['', Validators.required],
      Company_Name: ['', Validators.required],
      Position: ['', Validators.required],
      Department: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Phone: ['', Validators.required],
      Created_Date: [new Date()],
      Tax_code: [this.mst, Validators.required],
      Survey_Id: [this.surveyId, Validators.required],
    });
  }

  ngOnInit() {
    this.getInfoSurveyed();
    if (this.mst) {
      this.getCustomer();
      this.checkSurveyedCustomer();
      this.GetInfoCustomerSurveyedByMST();
    }

    this._http
      .get(this.baseUrl + '/survey/quesion', {
        params: { surveyId: this.surveyId },
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((data) => {
        this.dataQuesion.set(data);
      });

    this.getColumnsName();
    // this.form = this.createFormGroupFromObject(this.model)
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.stepperOrientation = result.matches ? 'vertical' : 'horizontal';
      });
  }

  getColumnsName() {
    this._http
      .get(this.baseUrl + '/survey/column-name')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((data) => {
        this.model = data;
      });
  }

  getErrorMessage() {
    if (this.formInfoCustomer.controls['Email'].hasError('required')) {
      return 'You must enter a value';
    }

    return this.formInfoCustomer.controls['Email'].hasError('email')
      ? 'Not a valid email'
      : '';
  }

  getCustomer() {
    this.isLoading.set(true);
    this._http
      .get(this.baseUrl + '/survey/customer', { params: { mst: this.mst } })
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((data: any) => {
        console.log(data);
        if (!data) {
          this.showSurvey.set(false);
          this.openDialog('Mã số thuế không tồn tại trên hệ thống');
          this.router.navigate(["/"])
          return;
        }
        this.formInfoCustomer.controls['Company_Name'].setValue(data.Ten_Dt);
      });
  }

  handleChange(event: MatCheckboxChange, item: any, isMultiple: boolean) {
    const existingObj = this.checkQuestionIdExist(item.Question_Id);
    const newObj = existingObj
      ? {
          ...existingObj,
          Note: this.note[item.Question_Id],
          Answers_Id:
            String(existingObj.Answer_Id) === ''
              ? String(existingObj.Answers_Id) + String(item.Answer_Id)
              : String(existingObj.Answers_Id) + ',' + String(item.Answer_Id),
        }
      : null;
    if (event.checked) {
      if (!newObj)
        this.surveyResult.push({
          ...this.formInfoCustomer.value,
          Question_Id: item.Question_Id,
          Answers_Id: String(item.Answer_Id),
          Note: this.note[item.Question_Id] ?? '',
        });
      else _.assign(existingObj, newObj);
    } else {
      this.surveyResult.forEach((itemAnswer: any) => {
        if (item.Question_Id === itemAnswer.Question_Id) {
          const filteredArray = _.without(
            itemAnswer.Answers_Id.split(','),
            String(item.Answer_Id)
          );
          itemAnswer.Answers_Id = filteredArray.toString();
        }
      });
    }
  }

  send() {
    this._dataService.setData(this.surveyResult);
    this._dataService.setDataQustion(this.dataQuesion());

    this.isLoading.set(true);
    this.checkSurveyedCustomer()
     _.remove(this.surveyResult, function(item: any) {
      return item.Answers_Id === '' && item.Note === '';
    });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    if(this.formInfoCustomer.valid){
      if(this.surveyResult.length === 0) {
        this._snackBar.open("bạn chư chọn bất kỳ câu trả lời nào","",{duration:3000});
        return
      }
    this._http
    .post(this.baseUrl + '/survey/result',{model:JSON.stringify(this.surveyResult)}, httpOptions)
    .pipe(
      takeUntilDestroyed(this._destroyRef),
      finalize(() => this.isLoading.set(false))
      )
    .subscribe((data: any) => {
      if(data.successful){
        this._snackBar.open(data.msg,"",{duration:1000});

        this.router.navigate(["result"])
      }
    });
    }
  }

  handleChangeRadio(answer: any, isMultiple: boolean) {
    const existingObj = this.checkQuestionIdExist(answer.Question_Id);
    if (existingObj) {
      _.assign(existingObj, {
        ...this.formInfoCustomer.value,
        Answers_Id: answer.Answer_Id,
        Question_Id: answer.Question_Id,
        Note: this.note[answer.Question_Id],
      });
    } else {
      this.surveyResult.push({
        ...this.formInfoCustomer.value,
        Answers_Id: answer.Answer_Id,
        Question_Id: answer.Question_Id,
        Note: this.note[answer.Question_Id],
      });
    }
  }

  handleChangeNote(Question_Id: any) {
    const existingObj = this.checkQuestionIdExist(Question_Id);

    if (existingObj) {
      _.forEach(this.surveyResult, (item) => {
        if (item.Question_Id === Question_Id) {
          item.Note = this.note[Question_Id] ?? '';
        }
      });
    } else {
      this.surveyResult.push({
        ...this.formInfoCustomer.value,
        Note: this.note[Question_Id],
        Question_Id,
      });
      console.log(this.surveyResult);
    }
  }

  formatLabel(value: number): string {
    return `${value}`;
  }

  checkSurveyedCustomer() {
    this._http
      .get(this.baseUrl + '/survey/check-surveyed', {
        params: { mst: this.mst, surveyId: this.surveyId },
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((data: any) => {
        if (data.successful) {
          this.showSurvey.set(false);
          this.openDialog(data.msg);
          return;
        }
      });
  }

  handleChangeScore(e: any, Question_Id: number | string, answers: any) {
    const answerId = answers.find(
      (item: any) => item.Answer_Text === e.target.value
    );
    const existingObj = this.checkQuestionIdExist(Question_Id);
    const newObj = existingObj
      ? {
          ...existingObj,
          Answers_Id: answerId.Answer_Id,
        }
      : null;

    if (!newObj)
      this.surveyResult.push({
        ...this.formInfoCustomer.value,
        Question_Id: Question_Id,
        Answers_Id: answerId.Answer_Id,
      });
    else _.assign(existingObj, newObj);
  }

  checkQuestionIdExist(Question_Id: number | string) {
    return _.find(this.surveyResult, {
      Question_Id: Question_Id,
    });
  }

  getInfoSurveyed() {
    this._http
      .get(this.baseUrl + '/survey', { params: { surveyId: this.surveyId } })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((data: any) => {
        if (!data) {
          this.showSurvey.set(false);
          this.openDialog('Kỳ đánh giá không tồn tại');
          this.router.navigate(["/"])
          return;
        }
      });
  }

  openDialog(message: string): void {
    const dialogRef = this.dialog.open(NofiticationComponent, {
      data: message,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  GetInfoCustomerSurveyedByMST() {
    this.isLoading.set(true);
    this._http
      .get(this.baseUrl + '/survey/customer-surveyed', {
        params: { mst: this.mst },
      })
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((data: any) => {
        if (data) {
          this.formInfoCustomer.controls['Company_Name'].setValue(
            data[0].Company_Name
          );
          this.formInfoCustomer.controls['Name'].setValue(data[0].Name);
          this.formInfoCustomer.controls['Position'].setValue(data[0].Position);
          this.formInfoCustomer.controls['Department'].setValue(
            data[0].Department
          );
          this.formInfoCustomer.controls['Email'].setValue(data[0].Email);
          this.formInfoCustomer.controls['Phone'].setValue(data[0].Phone);
          this.formInfoCustomer.controls['Phone'].setValue(data[0].Phone);
        }
      });
  }
}
