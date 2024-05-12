import { TestBed } from '@angular/core/testing';

import { WvserviceService } from './wvservice.service';

describe('WvserviceService', () => {
  let service: WvserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WvserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
