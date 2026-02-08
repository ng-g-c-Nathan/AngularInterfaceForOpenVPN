import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficCsvListComponent } from './traffic-csv-list-component';

describe('TrafficCsvListComponent', () => {
  let component: TrafficCsvListComponent;
  let fixture: ComponentFixture<TrafficCsvListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficCsvListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficCsvListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
