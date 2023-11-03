import { TestBed } from '@angular/core/testing';

import {  } from './data-service.service';

describe('DataServiceService', () => {
  let service: DataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
