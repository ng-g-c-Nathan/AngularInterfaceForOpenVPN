import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CRUD } from '../../service/Crud/crud';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, Search, Trash2, Activity, SearchCode, Calendar, 
  ChevronLeftIcon, ChevronRightIcon, RefreshCw, Clock, Database, Cpu, 
  Box, Layers, Eye, CheckCircle, AlertCircle 
} from 'lucide-angular';

/**
 * Componente Monitor
 * * Se encarga de la visualización y seguimiento del historial de tráfico y trabajos (jobs).
 * Proporciona herramientas de filtrado multidimensional, paginación de resultados
 * y un sistema de auto-refresco para monitoreo en tiempo real.
 */
@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './monitor.html',
  styleUrls: ['./monitor.css'],
})
export class Monitor implements OnInit, OnDestroy {

  // --- ICONOS (LUCIDE) ---
  // Referencias para renderizado dinámico en el template HTML
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

  // --- VARIABLES DE DATOS ---
  /** Set de datos completo proveniente del servidor */
  jobs: any[] = []; 
  /** Set de datos procesado tras aplicar filtros de búsqueda */
  filteredJobs: any[] = []; 

  // --- ESTADOS DE LA INTERFAZ (UI) ---
  /** Indica si hay una petición HTTP en proceso */
  isLoading = false;
  /** Controla si el polling de actualización automática está activo */
  autoRefresh = false;
  /** Marca de tiempo de la última sincronización con el servidor */
  lastUpdate: Date = new Date();
  /** Referencia al timer de JS para limpieza en la destrucción del componente */
  private refreshInterval: any;

  // --- PROPIEDADES DE FILTRADO ---
  filterFrom: string = '';
  filterTo: string = '';
  filterDuration: string = '';
  filterStatus: string = '';
  filterModel: string = '';
  filterMode: string = '';
  /** Lista dinámica de modelos extraída de los jobs para el selector de la UI */
  availableModels: string[] = [];
  
  // --- PAGINACIÓN ---
  page = 0;
  pageSize = 2;
  /** Exposición de Math para cálculos matemáticos directos en el HTML */
  Math = Math; 

  constructor(private crudService: CRUD) { }

  /**
   * Ciclo de vida: Inicializa el componente.
   * Carga los datos iniciales y configura el intervalo de refresco automático.
   */
  ngOnInit(): void {
    this.refreshJobs();

    // Configura un intervalo de 10 minutos para la actualización en segundo plano
    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) this.refreshJobs();
    }, 10 * 60 * 1000); 
  }

  /**
   * Ciclo de vida: Limpieza.
   * Asegura que el intervalo de refresco se detenga para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  // --- GETTERS DE PRESENTACIÓN ---

  /** * Retorna la porción de datos correspondiente a la página actual.
   */
  get pagedJobs() {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJobs.slice(start, end);
  }

  /** * Calcula el número total de páginas según los filtros aplicados.
   */
  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  // --- MÉTODOS DE COMUNICACIÓN CON EL SERVICIO ---

  /**
   * Obtiene el historial de tráfico desde el API.
   * Al recibir los datos, dispara automáticamente la lógica de filtrado.
   */
  refreshJobs(): void {
    this.isLoading = true;
    this.crudService.getTrafficHistory().subscribe({
      next: (data: any[]) => {
        this.jobs = data;
        this.applyFilters(); 
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

  // --- LÓGICA DE FILTRADO Y PROCESAMIENTO ---

  /**
   * Aplica filtros cruzados (Status, Duración, Modelo y Modo).
   * Además, regenera la lista de modelos únicos disponibles para el dropdown.
   */
  applyFilters(): void {
    this.page = 0;

    // 1. Extraer modelos únicos presentes en los datos para alimentar el filtro de la UI
    const models = this.jobs
      .map(j => j.result?.model_folder)
      .filter((val, index, self) => val && self.indexOf(val) === index);
    this.availableModels = models.sort();

    // 2. Ejecución del filtrado multicriterio
    this.filteredJobs = this.jobs.filter(job => {
      const matchDuration = !this.filterDuration || job.duration_category === this.filterDuration;
      const matchStatus = !this.filterStatus || job.status === this.filterStatus;
      const matchModel = !this.filterModel || job.result?.model_folder === this.filterModel;
      const matchMode = !this.filterMode || job.result?.mode === this.filterMode;

      return matchDuration && matchStatus && matchModel && matchMode;
    });
  }

  /**
   * Realiza un filtrado específico basado en el rango temporal (created_at).
   * Resetea la paginación a la primera página.
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
   * Limpia los inputs de fecha y restaura la vista de todos los trabajos.
   */
  clearFilters(): void {
    this.filterFrom = '';
    this.filterTo = '';
    this.filteredJobs = [...this.jobs];
    this.page = 0;
  }

  // --- NAVEGACIÓN DE PAGINACIÓN ---

  /** Incrementa el índice de página si hay resultados siguientes */
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filteredJobs.length) {
      this.page++;
    }
  }

  /** Decrementa el índice de página si no se está en el inicio */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

}