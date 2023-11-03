import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data-service.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-survey-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-result.component.html',
  styleUrls: ['./survey-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyResultComponent {

  result = signal([])
  question = signal([])
  resultWithText = signal<any>([])
  constructor(private _dataService: DataService,
    ){

  }

  ngOnInit(){
    this._dataService.getData().subscribe((data: any) => this.result.set(data))
    this._dataService.getDataQuestion().subscribe((data: any) => this.question.set(data))
    this.test()
    console.log(this.resultWithText())
  }

  

  test(){
    const formattedResult: any = [];

// Lặp qua mảng result
this.result().forEach((item: any) => {
    // Tách chuỗi Answers_Id thành mảng các id
    let questionText = ''
    const answerIds = String(item.Answers_Id).includes(",") ? item.Answers_Id.split(',') : [item.Answers_Id];
    // Tạo một mảng để lưu các câu trả lời
    const answers: any = [];

    // Lặp qua mảng answerIds
    answerIds.forEach((answerId: any) => {
        // Tìm câu trả lời tương ứng trong mảng question
        const answer: any = this.question().find((q: any) => q.question.Question_Id === item.Question_Id && q.answers.some((a: any) => a.Answer_Id === parseInt(answerId)));

        // Kiểm tra nếu tìm thấy câu trả lời
        if (answer) {
            // Lấy Question_Text và Answer_Text
           questionText = answer.question.Question_Text;
            const answerText = answer.answers.find((a: any) => a.Answer_Id === parseInt(answerId)).Answer_Text;

            // Thêm câu trả lời vào mảng answers
            answers.push({
                Answer_Text: answerText
            });
        }
    });

    // Thêm kết quả vào mảng formattedResult
    formattedResult.push({
        Result_Id: item.Result_Id,
        Tax_Code: item.Tax_Code,
        Survey_Id: item.Survey_Id,
        Question_Id: item.Question_Id,
        Answers_Id: item.Answers_Id,
        Note: item.Note,
        Name: item.Name,
        Position: item.Position,
        Department: item.Department,
        Email: item.Email,
        Phone: item.Phone,
        Created_Date: item.Created_Date,
        Company_Name: item.Company_Name,
        Question_Text: questionText,
        Answers: answers
    });
});

    this.resultWithText.set(formattedResult)
  }
}
