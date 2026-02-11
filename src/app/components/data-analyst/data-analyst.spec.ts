import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalyst } from './data-analyst';

describe('DataAnalyst', () => {
  let component: DataAnalyst;
  let fixture: ComponentFixture<DataAnalyst>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAnalyst]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAnalyst);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
