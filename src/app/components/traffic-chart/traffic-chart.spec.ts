import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficChart } from './traffic-chart';

describe('TrafficChart', () => {
  let component: TrafficChart;
  let fixture: ComponentFixture<TrafficChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
