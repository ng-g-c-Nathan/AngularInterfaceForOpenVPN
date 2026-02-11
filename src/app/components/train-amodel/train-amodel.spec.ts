import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainAModel } from './train-amodel';

describe('TrainAModel', () => {
  let component: TrainAModel;
  let fixture: ComponentFixture<TrainAModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainAModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainAModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
