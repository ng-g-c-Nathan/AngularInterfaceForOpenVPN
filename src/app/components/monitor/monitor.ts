import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CRUD } from '../../service/Crud/crud';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, Search, Trash2, Activity, SearchCode, Calendar, 
  ChevronLeftIcon, ChevronRightIcon, RefreshCw, Clock, Database, Cpu, 
  Box, Layers, Eye, CheckCircle, AlertCircle 
} from 'lucide-angular';

@Component({
  selector: 'app-monitor',
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './monitor.html',
  styleUrls: ['./monitor.css'],
})
export class Monitor implements OnInit, OnDestroy {

  /** * Referencias de iconos para uso en el template HTML.
   */
  readonly Activity = Activity;
  readonly RefreshCw = RefreshCw;
  readonly Search = Search;
  readonly Clock = Clock;
  readonly Trash2 = Trash2;
  readonly Layers = Layers;
  readonly Eye = Eye;
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly AlertCircle = AlertCircle;
  readonly Cpu = Cpu;
  readonly Box = Box;
  readonly SearchCode = SearchCode;
  readonly Database = Database;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;

  /** * Listado de trabajos (jobs) y datos filtrados.
   */
  jobs: any[] = [];           // Lista completa de trabajos desde el servidor
  filteredJobs: any[] = [];   // Lista de trabajos tras aplicar filtros

  /** * Estado de la interfaz de usuario (UI).
   */
  isLoading = false;
  autoRefresh = false;
  lastUpdate: Date = new Date();
  private refreshInterval: any;

  /** * Propiedades de filtrado y paginación.
   */
  filterFrom: string = '';
  filterTo: string = '';
  filterDuration: string = '';
  filterStatus: string = '';
  filterModel: string = '';
  filterMode: string = '';
  availableModels: string[] = [];
  
  page = 0;
  pageSize = 2;
  Math = Math; // Utilidad para cálculos en el template

  constructor(private crudService: CRUD) { }

  /**
   * Inicializa el componente cargando los datos y configurando el intervalo de refresco.
   */
  ngOnInit(): void {
    this.refreshJobs();

    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) this.refreshJobs();
    }, 10 * 60 * 1000); // Refresco cada 10 minutos
  }

  /**
   * Limpia los recursos y detiene el intervalo de refresco al destruir el componente.
   */
  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  /**
   * Obtiene el subconjunto de trabajos para mostrar según la paginación actual.
   */
  get pagedJobs() {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJobs.slice(start, end);
  }

  /**
   * Obtiene el total de páginas basado en los resultados filtrados.
   */
  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  /**
   * Solicita al servicio la actualización de la lista de tráfico/trabajos.
   */
  refreshJobs(): void {
    this.isLoading = true;
    this.crudService.getTrafficHistory().subscribe({
      next: (data: any[]) => {
        this.jobs = data;
        this.applyFilters(); // Sincroniza la lista filtrada tras la carga
        this.isLoading = false;
        this.lastUpdate = new Date();
      },
      error: (err) => {
        console.error('Error al actualizar jobs:', err);
        this.isLoading = false;
        this.jobs = [];
      }
    });
  }

  /**
   * Ejecuta la lógica de filtrado multidimensional (Status, Duración, Modelo, Modo).
   * También actualiza la lista de modelos disponibles dinámicamente.
   */
  applyFilters(): void {
    this.page = 0;

    // 1. Extraer modelos únicos para los selectores de la UI
    const models = this.jobs
      .map(j => j.result?.model_folder)
      .filter((val, index, self) => val && self.indexOf(val) === index);
    this.availableModels = models.sort();

    // 2. Aplicar criterios de filtrado
    this.filteredJobs = this.jobs.filter(job => {
      const matchDuration = !this.filterDuration || job.duration_category === this.filterDuration;
      const matchStatus = !this.filterStatus || job.status === this.filterStatus;
      const matchModel = !this.filterModel || job.result?.model_folder === this.filterModel;
      const matchMode = !this.filterMode || job.result?.mode === this.filterMode;

      return matchDuration && matchStatus && matchModel && matchMode;
    });
  }

  /**
   * Filtra la lista actual basándose en un rango de fechas de creación.
   */
  onFilter(): void {
    this.page = 0; 
    if (!this.filterFrom && !this.filterTo) {
      this.filteredJobs = [...this.jobs];
      return;
    }

    this.filteredJobs = this.jobs.filter(job => {
      const jobDate = new Date(job.created_at).getTime();
      const from = this.filterFrom ? new Date(this.filterFrom).getTime() : 0;
      const to = this.filterTo ? new Date(this.filterTo).getTime() : Infinity;
      return jobDate >= from && jobDate <= to;
    });
  }

  /**
   * Restablece los filtros de fecha y restaura la lista completa.
   */
  clearFilters(): void {
    this.filterFrom = '';
    this.filterTo = '';
    this.filteredJobs = [...this.jobs];
    this.page = 0;
  }

  /**
   * Avanza a la siguiente página de la lista.
   */
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filteredJobs.length) {
      this.page++;
    }
  }

  /**
   * Retrocede a la página anterior de la lista.
   */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

  /**
   * Gestiona la visualización de detalles de un trabajo específico.
   * @param job El objeto del trabajo a inspeccionar.
   */
  viewDetails(job: any): void {
    console.log('Mostrando detalles de:', job.job_id);
    // Implementar navegación o apertura de modal aquí
  }
}