import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD } from '../../service/Crud/crud';
import { take } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

// Importación masiva de iconos para la interfaz de reportes
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon,
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download, 
  LucideAngularComponent
} from 'lucide-angular';

@Component({
  selector: 'app-traffic-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './traffic-chart.html',
  styleUrls: ['./traffic-chart.css', '../../../styles.css'],
})
export class TrafficChart implements OnInit {

  // Referencias de iconos para el template (Lucide)
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly RefreshCw = RefreshCw;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Search = Search;

  // Estado de carga y datos
  isLoading: boolean = false;
  selectedRange: number = 7;
  files: any[] = [];

  /** Rangos predefinidos para el filtrado rápido */
  dateRanges = [
    { label: '7 días', days: 7 },
    { label: '14 días', days: 14 },
    { label: '30 días', days: 30 },
  ];

  // Modelos para el filtrado por fechas personalizado
  filterFrom: string = '';
  filterTo: string = '';

  constructor(private crud: CRUD) {}

  ngOnInit() {
    this.loadTrafficRange(this.selectedRange);
  }

  // --- Propiedades Computadas (Totales) ---

  /** @returns Suma total de tráfico de entrada formateado a 1 decimal */
  get totalIn() {
    return this.files.reduce((sum, d) => sum + d.totalInput, 0).toFixed(1);
  }

  /** @returns Suma total de tráfico de salida formateado a 1 decimal */
  get totalOut() {
    return this.files.reduce((sum, d) => sum + d.totalOutput, 0).toFixed(1);
  }

  // --- Gestión de Rangos y Filtros ---

  /** * Actualiza el rango de días y dispara la carga de datos
   * @param days Número de días hacia atrás desde hoy
   */
  setRange(days: number) {
    this.selectedRange = days;
    this.loadTrafficRange(days);
  }

  /** Calcula las fechas 'desde/hasta' basadas en un número de días */
  loadTrafficRange(days: number) {
    this.isLoading = true;

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));

    this.loadTrafficData(from, to);
  }

  /** Maneja el cambio en los inputs de fecha personalizados */
  onDateFilterChange() {
    if (!this.filterFrom || !this.filterTo) return;

    const from = new Date(this.filterFrom);
    const to = new Date(this.filterTo);

    this.selectedRange = 0; // Resetear rango predefinido al usar personalizado
    this.loadTrafficData(from, to);
  }

  /** Limpia los filtros y restaura el rango por defecto */
  cleanFiles() {
    this.filterFrom = '';
    this.filterTo = '';
    this.loadTrafficRange(this.selectedRange);
  }

  // --- Lógica de Comunicación con el Servicio ---

  /** * Función central para la obtención de datos de tráfico
   * Realiza la llamada al servicio CRUD y mapea la respuesta
   */
  private loadTrafficData(from: Date, to: Date) {
    this.isLoading = true;

    // Formateo de fecha para la API (YYYY-MM-DD)
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    this.crud.getTrafficRange(fromStr, toStr)
      .pipe(take(1)) // Autocompletar suscripción tras la primera respuesta
      .subscribe({
        next: (data: any[]) => {
          this.files = data.map(item => ({
            ...item,
            trafficIn: item.totalInput,
            trafficOut: item.totalOutput,
            date: new Date(item.date) 
          }));

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando tráfico:', err);
          this.isLoading = false;
        }
      });
  }
}