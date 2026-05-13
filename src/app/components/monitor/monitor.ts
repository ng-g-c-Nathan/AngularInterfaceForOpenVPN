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
 * Se encarga de la visualización y seguimiento del historial de tráfico y trabajos (jobs).
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
  jobs: any[] = [];
  filteredJobs: any[] = [];

  // --- ESTADOS DE LA INTERFAZ (UI) ---
  isLoading = false;
  autoRefresh = false;
  lastUpdate: Date = new Date();
  private refreshInterval: any;

  // --- PROPIEDADES DE FILTRADO ---
  filterFrom: string = '';
  filterTo: string = '';
  filterDuration: string = '';
  filterStatus: string = '';
  filterModel: string = '';
  filterMode: string = '';
  availableModels: string[] = [];

  // --- PAGINACIÓN ---
  page = 0;
  pageSize = 2;
  Math = Math;

  selectedJobId: string | null = null;

  constructor(private crudService: CRUD) { }

  ngOnInit(): void {
    this.refreshJobs();
    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) this.refreshJobs();
    }, 10 * 60 * 1000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  // --- GETTERS DE PRESENTACIÓN ---

  get pagedJobs() {
    const start = this.page * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  // --- COMUNICACIÓN CON EL SERVICIO ---

  refreshJobs(): void {
    this.isLoading = true;
    this.crudService.getTrafficHistory().subscribe({
      next: (data: any[]) => {
        console.log("Monitor jeje"+data)
        this.jobs = data;
        this.applyFilters();
        this.isLoading = false;
        this.lastUpdate = new Date();
      },
      error: (e) => {
        console.log("Error"+e)
        this.isLoading = false;
        this.jobs = [];
      }
    });
  }

  // --- FILTRADO UNIFICADO ---

  /**
   * Aplica TODOS los filtros en una sola pasada:
   * status, duración, modelo, modo y rango de fechas.
   * Anteriormente onFilter() y applyFilters() se sobreescribían entre sí.
   */
  applyFilters(): void {
    this.page = 0;

    // Modelos únicos para el dropdown
    this.availableModels = [...new Set(
      this.jobs
        .map(j => j.result?.model_folder)
        .filter(Boolean)
    )].sort();
    this.filteredJobs = this.jobs.filter(job => {
      const matchDuration = !this.filterDuration || job.duration_category === this.filterDuration;
      const matchStatus   = !this.filterStatus   || job.status === this.filterStatus;
      const matchModel    = !this.filterModel    || job.result?.model_folder === this.filterModel;
      const matchMode     = !this.filterMode     || job.result?.mode === this.filterMode;

      const jobTime = new Date(job.created_at).getTime();
      const from    = this.filterFrom ? new Date(this.filterFrom).getTime() : 0;
      const to      = this.filterTo   ? new Date(this.filterTo).getTime()   : Infinity;
      const matchDate = jobTime >= from && jobTime <= to;

      return matchDuration && matchStatus && matchModel && matchMode && matchDate;
    });
  }

  /** Limpia todos los filtros y recalcula */
  clearFilters(): void {
    this.filterFrom     = '';
    this.filterTo       = '';
    this.filterDuration = '';
    this.filterStatus   = '';
    this.filterModel    = '';
    this.filterMode     = '';
    this.applyFilters();
  }

  // --- PAGINACIÓN ---

  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filteredJobs.length) this.page++;
  }

  prevPage(): void {
    if (this.page > 0) this.page--;
  }

  // --- DETALLE DE JOB ---

  toggleJob(jobId: string) {
    this.selectedJobId = this.selectedJobId === jobId ? null : jobId;
  }

  getRiskLevel(ratio: number): 'safe' | 'warning' | 'danger' {
    if (ratio < 0.10) return 'safe';
    if (ratio < 0.25) return 'warning';
    return 'danger';
  }
}