import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvViewer } from './csv-viewer';

describe('CsvViewer', () => {
  let component: CsvViewer;
  let fixture: ComponentFixture<CsvViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
