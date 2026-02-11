import { Routes } from '@angular/router';
import { TrafficCsvListComponent } from './components/traffic-csv-list-component/traffic-csv-list-component';
import { TrafficChart } from './components/traffic-chart/traffic-chart';
import { CsvViewer } from './components/csv-viewer/csv-viewer';
import { AdminActions } from './components/admin-actions/admin-actions';
import { DataAnalyst } from './components/data-analyst/data-analyst';
import { Monitor } from './components/monitor/monitor';
import { TrainAModel } from './components/train-amodel/train-amodel';
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
    path: 'data',
    component: DataAnalyst
  },
  {
    path: 'monitor',
    component: Monitor
  },
  {
    path: 'csv',
    component: CsvViewer
  },
    {
    path: 'training',
    component: TrainAModel
  },
  {
    path: '**',
    component: TrafficCsvListComponent
  }
];
