import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Servicios y Módulos de Iconos
import { CRUD } from '../../service/Crud/crud';
import { LucideAngularModule } from 'lucide-angular';
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon,
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download 
} from 'lucide-angular';

@Component({
  selector: 'app-traffic-csv-list-component',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, CommonModule],
  templateUrl: './traffic-csv-list-component.html',
  styleUrls: ['./traffic-csv-list-component.css', '../../../styles.css'],
})
export class TrafficCsvListComponent implements OnInit, OnDestroy {
  
  /** * Subject para gestionar la desuscripción automática de observables.
   * Evita fugas de memoria al destruir el componente.
   */
  private destroy$ = new Subject<void>();

  /** * Referencias de iconos para uso en el template HTML.
   */
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly RefreshCw = RefreshCw;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Search = Search;

  /** * Propiedades de paginación y utilidades.
   */
  Math = Math;
  page: number = 0;
  pageSize: number = 3;

  /** * Estado local del componente y datos.
   */
  files: any[] = [];           // Lista de archivos filtrada/actual
  aux: any[] = [];             // Copia de seguridad para filtros
  isLoading: boolean = true;
  lastUpdate: Date = new Date();
  autoRefresh: boolean = true;
  filterFrom: string = '';
  filterTo: string = '';

  constructor(
    private crudService: CRUD,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa el componente cargando los archivos y configurando el refresco automático.
   */
  ngOnInit(): void {
    this.fetchFiles();

    if (this.autoRefresh) {
      setInterval(() => this.fetchFiles(), 10 * 60 * 1000);
    }
  }

  /**
   * Limpia las suscripciones activas al destruir el componente.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtiene la lista de archivos CSV desde el servidor.
   * Mapea los datos recibidos para asegurar el formato de fecha y tipos.
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
            csvStatus: file.csvStatus
          }));
          this.aux = [...this.files];
          this.lastUpdate = new Date();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener los archivos CSV:', err);
          this.isLoading = false;
        }
      });
  }

  /**
   * Intenta reparar un archivo CSV que presenta errores de estado.
   * @param file El objeto del archivo a reparar.
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


  /**
   * Obtiene el subconjunto de archivos según la página actual.
   */
  get pagedFiles() {
    const start = this.page * this.pageSize;
    return this.files.slice(start, start + this.pageSize);
  }

  /**
   * Avanza a la siguiente página de resultados.
   */
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.files.length) {
      this.page++;
    }
  }

  /**
   * Retrocede a la página anterior de resultados.
   */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

  /**
   * Restaura la lista de archivos a su estado original y limpia los inputs de filtro.
   */
  cleanFiles(): void {
    this.files = [...this.aux];
    this.filterFrom = '';
    this.filterTo = '';
  }

  /**
   * Filtra la lista de archivos basándose en un rango de fechas (lastModified).
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
    
    this.page = 0; // Reiniciar paginación al filtrar
  }


  /**
   * Lógica para la previsualización de un archivo específico.
   * @param file Objeto del archivo a visualizar.
   */
  handleView(file: any): void {
    console.log('Viewing file:', file.name);
  }

  /**
   * Gestiona la descarga de un archivo del listado.
   * @param file Objeto del archivo a descargar.
   */
  handleDownload(file: any): void {
    console.log('Downloading file:', file.name);
  }
}