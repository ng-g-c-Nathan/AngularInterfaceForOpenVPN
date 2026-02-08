import { TestBed } from '@angular/core/testing';

import { CRUD } from './crud';

describe('CRUD', () => {
  let service: CRUD;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CRUD);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
