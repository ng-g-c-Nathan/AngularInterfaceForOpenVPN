import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

// Servicios y Módulos de Iconos
import { CRUD } from '../../service/Crud/crud';
import { LucideAngularModule } from 'lucide-angular';
import {
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon, SearchCode,
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download
} from 'lucide-angular';

/**
 * Componente TrafficCsvListComponent
 * * Gestiona la visualización, filtrado y acciones de archivos de tráfico en formato CSV.
 * Incluye funcionalidades de paginación, auto-refresco, filtrado por fecha y 
 * comunicación con servicios de reparación y análisis (scoring) de tráfico.
 */
@Component({
  selector: 'app-traffic-csv-list-component',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './traffic-csv-list-component.html',
  styleUrls: ['./traffic-csv-list-component.css', '../../../styles.css'],
})
export class TrafficCsvListComponent implements OnInit, OnDestroy {

  // --- GESTIÓN DE MEMORIA ---
  /** Subject para gestionar la desuscripción automática de observables y evitar memory leaks */
  private destroy$ = new Subject<void>();

  // --- ICONOS (LUCIDE) ---
  /** Referencias de iconos para uso en el template HTML */
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly RefreshCw = RefreshCw;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Activity = Activity;
  readonly SearchCode = SearchCode;
  readonly Search = Search;

  // --- PAGINACIÓN Y UTILIDADES ---
  /** Referencia a Math para cálculos matemáticos en el template */
  Math = Math;
  /** Índice de la página actual */
  page: number = 0;
  /** Cantidad de elementos por página */
  pageSize: number = 3;
  /** Controla la visibilidad del aviso de "Enviado a revisión" */
  showReviewMessage = false;

  // --- ESTADO LOCAL Y DATOS ---
  /** Lista de archivos procesada y filtrada que se muestra en la UI */
  files: any[] = [];
  /** Copia de seguridad de los datos originales para realizar filtros rápidos */
  aux: any[] = [];
  /** Indica si los datos están siendo cargados desde el servidor */
  isLoading: boolean = true;
  /** Almacena la marca de tiempo de la última actualización exitosa */
  lastUpdate: Date = new Date();
  /** Define si el componente debe actualizarse automáticamente */
  autoRefresh: boolean = true;
  /** Fecha inicial para el filtro de rango */
  filterFrom: string = '';
  /** Fecha final para el filtro de rango */
  filterTo: string = '';

  constructor(
    private crudService: CRUD,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  /**
   * Ciclo de vida: Inicializa la carga de archivos y configura el intervalo
   * de actualización automática (cada 10 minutos).
   */
  ngOnInit(): void {
    this.fetchFiles();

    if (this.autoRefresh) {
      // Configura el intervalo de refresco cada 10 minutos
      setInterval(() => this.fetchFiles(), 10 * 60 * 1000);
    }
  }

  /**
   * Ciclo de vida: Limpia las suscripciones activas al destruir el componente
   * para prevenir fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- MÉTODOS DE DATOS (API) ---

  /**
   * Obtiene la lista de archivos CSV desde el backend.
   * Transforma las fechas de string a objetos Date para su manipulación.
   */
  fetchFiles(): void {
    this.isLoading = true;
    this.crudService.getTrafficCsvListComponent()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.files = data.map((file: any) => ({
            name: file.name,
            lastModified: new Date(file.lastModified),
            size: file.size,
            csvStatus: file.csvStatus,
            csvPath: file.csvPath
          }));
          this.aux = [...this.files];
          this.lastUpdate = new Date();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los archivos CSV:', err);
          this.isLoading = false;
        }
      });
  }

  /**
   * Envía una petición para reparar un archivo CSV que reporta errores.
   * Cambia el estado visual a 'pending' tras una respuesta exitosa.
   * @param file Objeto del archivo a reparar.
   */
  onCsvErrorClick(file: any): void {
    this.crudService.repararCsv(file.name).subscribe({
      next: () => {
        file.csvStatus = 'pending';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al intentar reparar:', err)
    });
  }

  // --- LÓGICA DE PAGINACIÓN ---

  /**
   * Getter que retorna el segmento de archivos correspondiente a la página actual.
   */
  get pagedFiles() {
    const start = this.page * this.pageSize;
    return this.files.slice(start, start + this.pageSize);
  }

  /** Avanza a la siguiente página de resultados si existe */
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.files.length) {
      this.page++;
    }
  }

  /** Retrocede a la página anterior de resultados si no está en la primera */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

  // --- FILTROS Y BÚSQUEDA ---

  /**
   * Restaura la lista de archivos a su estado original (sin filtros)
   * y limpia los campos de entrada de fecha.
   */
  cleanFiles(): void {
    this.files = [...this.aux];
    this.filterFrom = '';
    this.filterTo = '';
    this.page = 0;
  }

  /**
   * Filtra la colección de archivos basándose en un rango de fechas de modificación.
   * Si las fechas son inválidas o están vacías, restaura la lista original.
   */
  onDateFilterChange(): void {
    if (!this.filterFrom || !this.filterTo) {
      this.cleanFiles();
      return;
    }

    const fromDate = new Date(this.filterFrom);
    const toDate = new Date(this.filterTo);

    this.files = this.aux.filter(file => {
      const fileDate = new Date(file.lastModified);
      return fileDate >= fromDate && fileDate <= toDate;
    });

    this.page = 0; // Reiniciar paginación al aplicar nuevos filtros
  }

  // --- ACCIONES DE USUARIO ---

  /**
   * Navega a la vista de detalle de un CSV utilizando su ruta como parámetro.
   * @param csvPath Ruta del archivo en el servidor.
   */
  handleView(csvPath: string): void {
    this.router.navigate(
      ['/csv'],
      { queryParams: { path: csvPath } }
    );
  }

  /**
   * Envía el archivo seleccionado al servicio de scoring de tráfico.
   * Muestra un mensaje de éxito temporal y gestiona errores de procesamiento.
   * @param csvPath Ruta del archivo para analizar.
   */
  handleDownload(csvPath: string): void {
    console.log('Enviando a revisión:', csvPath);

    this.crudService.scoreTraffic(csvPath).subscribe({
      next: (res) => {
        this.showReviewMessage = true;
        // Ocultar notificación de éxito tras 5 segundos
        setTimeout(() => {
          this.showReviewMessage = false;
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.error('Error al enviar a revisión', err);
        alert('Hubo un error al procesar la solicitud');
      }
    });
  }
}