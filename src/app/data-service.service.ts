import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private dataSubject = new BehaviorSubject<any>([]);
  private dataSubjectQuestion = new BehaviorSubject<any>([]);

  setData(data: any) {
    this.dataSubject.next(data); 
  }

  setDataQustion(data: any) {
    this.dataSubjectQuestion.next(data); 
  }

  getData() {
    return this.dataSubject.asObservable();
  }

  getDataQuestion() {
    return this.dataSubjectQuestion.asObservable();
  }
}
