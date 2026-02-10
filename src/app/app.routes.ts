import { Routes } from '@angular/router';
import { TrafficCsvListComponent } from './components/traffic-csv-list-component/traffic-csv-list-component';
import { TrafficChart } from './components/traffic-chart/traffic-chart';
import { AdminActions } from './components/admin-actions/admin-actions';
export const routes: Routes = [
  {
    path: '', 
    redirectTo: 'traffic-list',
    pathMatch: 'full'
  },
  {
    path: 'traffic-list', 
    component: TrafficCsvListComponent
  },
  {
    path: 'traffic', 
    component: TrafficChart
  },
    {
    path: 'admin', 
    component: AdminActions
  },
  {
    path: '**', 
    component: TrafficCsvListComponent
  }
];
