import { Routes } from '@angular/router';
import { TrafficCsvListComponent } from './components/traffic-csv-list-component/traffic-csv-list-component';

export const routes: Routes = [
  {
    path: '**', 
    component: TrafficCsvListComponent
  }
];
