import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD } from '../../service/Crud/crud';
import { take } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

// Importación de iconos para la interfaz de reportes y gráficas
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon,
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download
} from 'lucide-angular';

/**
 * Componente TrafficChart
 * * Se encarga de la visualización y filtrado de métricas de tráfico de red.
 * Permite al usuario consultar historiales mediante rangos predefinidos o
 * un selector de fechas personalizado, calculando totales en tiempo real.
 */
@Component({
  selector: 'app-traffic-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './traffic-chart.html',
  styleUrls: ['./traffic-chart.css', '../../../styles.css'],
})
export class TrafficChart implements OnInit {

  // --- ICONOS (LUCIDE) ---
  // Referencias para uso directo en el template HTML
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly RefreshCw = RefreshCw;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Search = Search;

  // --- VARIABLES DE ESTADO Y DATOS ---
  /** Indica si hay una petición HTTP en proceso para mostrar skeletons/spinners */
  isLoading: boolean = false;
  /** El rango de días seleccionado actualmente (por defecto 7) */
  selectedRange: number = 7;
  /** Listado de registros de tráfico obtenidos del servidor */
  files: any[] = [];

  /** * Configuración de botones de acceso rápido 
   * Define los intervalos temporales más comunes para el usuario.
   */
  readonly dateRanges = [
    { label: '7 días', days: 7 },
    { label: '14 días', days: 14 },
    { label: '30 días', days: 30 },
  ];

  // --- MODELOS DE FILTRADO PERSONALIZADO ---
  /** Fecha de inicio capturada desde el input type="date" */
  filterFrom: string = '';
  /** Fecha de fin capturada desde el input type="date" */
  filterTo: string = '';

  constructor(private crud: CRUD) {}

  /**
   * Ciclo de vida: Inicializa el componente cargando el rango predeterminado.
   */
  ngOnInit() {
    this.loadTrafficRange(this.selectedRange);
  }

  // --- PROPIEDADES COMPUTADAS (TOTALES) ---

  /** * Calcula la sumatoria del tráfico de entrada (Input).
   * @returns Total formateado a un decimal.
   */
  get totalIn() {
    return this.files.reduce((sum, d) => sum + (d.totalInput || 0), 0).toFixed(1);
  }

  /** * Calcula la sumatoria del tráfico de salida (Output).
   * @returns Total formateado a un decimal.
   */
  get totalOut() {
    return this.files.reduce((sum, d) => sum + (d.totalOutput || 0), 0).toFixed(1);
  }

  // --- GESTIÓN DE RANGOS Y FILTROS ---

  /** * Actualiza el estado del rango y dispara la carga de datos.
   * @param days Número de días hacia atrás a consultar.
   */
  setRange(days: number) {
    this.selectedRange = days;
    this.loadTrafficRange(days);
  }

  /** * Calcula los objetos Date necesarios para la consulta basados en días naturales.
   * @param days Cantidad de días previos a la fecha actual.
   */
  loadTrafficRange(days: number) {
    this.isLoading = true;

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));

    this.loadTrafficData(from, to);
  }

  /** * Reacciona al cambio de fechas manual. 
   * Resetea el rango predefinido (0) para indicar que se usa un filtro custom.
   */
  onDateFilterChange() {
    if (!this.filterFrom || !this.filterTo) return;

    const from = new Date(this.filterFrom);
    const to = new Date(this.filterTo);

    this.selectedRange = 0; 
    this.loadTrafficData(from, to);
  }

  /** * Limpia los campos de fecha y restaura la vista a los últimos 7 días.
   */
  cleanFiles() {
    this.filterFrom = '';
    this.filterTo = '';
    this.selectedRange = 7; // Restauramos valor por defecto
    this.loadTrafficRange(this.selectedRange);
  }

  // --- LÓGICA DE COMUNICACIÓN CON EL SERVICIO (API) ---

  /** * Función núcleo de comunicación.
   * Transforma las fechas a formato ISO String (YYYY-MM-DD) y mapea la respuesta.
   * @param from Fecha de inicio del reporte.
   * @param to Fecha de fin del reporte.
   */
  private loadTrafficData(from: Date, to: Date) {
    this.isLoading = true;

    // Formateo estricto para compatibilidad con la API
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    this.crud.getTrafficRange(fromStr, toStr)
      .pipe(take(1)) // Evita fugas de memoria cerrando la suscripción tras el primer valor
      .subscribe({
        next: (data: any[]) => {
          // Mapeo y normalización de la data para el template
          this.files = data.map(item => ({
            ...item,
            trafficIn: item.totalInput,
            trafficOut: item.totalOutput,
            date: new Date(item.date) 
          }));

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error crítico cargando tráfico:', err);
          this.isLoading = false;
        }
      });
  }
}