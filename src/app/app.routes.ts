import { Routes } from '@angular/router';

/** * Importación de componentes para el enrutamiento de la aplicación 
 */
import { TrafficCsvListComponent } from './components/traffic-csv-list-component/traffic-csv-list-component';
import { TrafficChart } from './components/traffic-chart/traffic-chart';
import { CsvViewer } from './components/csv-viewer/csv-viewer';
import { AdminActions } from './components/admin-actions/admin-actions';
import { DataAnalyst } from './components/data-analyst/data-analyst';
import { Monitor } from './components/monitor/monitor';

/**
 * @description Definición de las rutas de navegación para la aplicación Conqueror.
 * Este array configura el Router de Angular para mapear las URLs a sus respectivos componentes.
 * * @constant routes
 * @type {Routes}
 */
export const routes: Routes = [
  /**
   * Ruta raíz: Redirige automáticamente a la lista de tráfico.
   * pathMatch: 'full' asegura que solo ocurra cuando la URL está vacía.
   */
  {
    path: '',
    redirectTo: 'traffic-list',
    pathMatch: 'full'
  },

  /** 
   * * @path traffic-list
   * @component TrafficCsvListComponent
   * Vista principal que lista los archivos CSV de tráfico procesados.
   */
  {
    path: 'traffic-list',
    component: TrafficCsvListComponent
  },

  /** 
   * * @path traffic
   * @component TrafficChart
   * Visualización gráfica del tráfico (Tráfico por Días).
   */
  {
    path: 'traffic',
    component: TrafficChart
  },

  /** 
   * * @path admin
   * @component AdminActions
   * Interfaz para la ejecución de comandos y configuraciones administrativas.
   */
  {
    path: 'admin',
    component: AdminActions
  },

  /** 
   * * @path data
   * @component DataAnalyst
   * Módulo especializado en el análisis profundo de datos.
   */
  {
    path: 'data',
    component: DataAnalyst
  },

  /** 
   * * @path monitor
   * @component Monitor
   * Panel de control y monitoreo en tiempo real del sistema.
   */
  {
    path: 'monitor',
    component: Monitor
  },

  /** 
   * * @path csv
   * @component CsvViewer
   * Herramienta para visualizar el contenido crudo de los archivos CSV.
   */
  {
    path: 'csv',
    component: CsvViewer
  },

  /** 
   * * Comodín (Wildcard): Captura cualquier URL no definida.
   * @description Si el usuario ingresa una ruta inexistente, se redirige a la lista de tráfico.
   */
  {
    path: '**',
    component: TrafficCsvListComponent
  }
];