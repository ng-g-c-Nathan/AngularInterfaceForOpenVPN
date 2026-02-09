import { Component, OnDestroy, OnInit } from '@angular/core';
import { CRUD } from '../../service/crud';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core'; // Importar esto
// Importación de iconos específicos para la interfaz de archivos
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2,Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon,
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download 
} from 'lucide-angular';

@Component({
  selector: 'app-traffic-csv-list-component',
  imports: [LucideAngularModule, FormsModule, CommonModule],
  templateUrl: './traffic-csv-list-component.html',
  styleUrls: ['./traffic-csv-list-component.css','../../../styles.css'],
})
export class TrafficCsvListComponent implements OnInit, OnDestroy {
  /** * Subject para gestionar la desuscripción automática de observables
   * Evita fugas de memoria al destruir el componente.
   */
  private destroy$ = new Subject<void>();

  // Referencias de iconos para uso en el template HTML
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly RefreshCw = RefreshCw;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly Search = Search;
  Math = Math;
  page = 0;
  pageSize = 3;


  // Estado local del componente
  files: any[] = [];
  aux: any[] = [];
  isLoading: boolean = true;
  lastUpdate: Date = new Date();
  autoRefresh: boolean = true;
  filterFrom: string = '';
  filterTo: string = '';
  // Inyección del servicio de datos
  constructor(private crudService: CRUD,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchFiles();

    /** * Configuración del refresco automático.
     * Actualiza la lista cada 10 minutos si la opción está activa.
     */
    if (this.autoRefresh) {
      setInterval(() => this.fetchFiles(), 10 * 60 * 1000);
    }
  }

  /**
   * Ciclo de vida: Limpieza al destruir el componente.
   * Emite una señal para cancelar todas las suscripciones activas.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /** * Obtiene la lista de archivos CSV desde el servidor.
   * Mapea los datos recibidos para asegurar el formato de fecha y tipos.
   */
   fetchFiles(): void {
    this.isLoading = true;
    this.crudService.getTrafficCsvListComponent()
      .pipe(takeUntil(this.destroy$)) // Cancelación automática si el componente se destruye 
      .subscribe({
        next: (data) => {
          this.files = data.map((file: any) => ({
            name: file.name,
            lastModified: new Date(file.lastModified),
            size: file.size,
            csvStatus: file.csvStatus
          }));
          this.aux = this.files;
          this.lastUpdate = new Date();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener los archivos CSV:', err);
          this.isLoading = false;
        }
      });
  }

get pagedFiles() {
  const start = this.page * this.pageSize;
  return this.files.slice(start, start + this.pageSize);
}

nextPage() {
  if ((this.page + 1) * this.pageSize < this.files.length) {
    this.page++;
  }
}

prevPage() {
  if (this.page > 0) {
    this.page--;
  }
}


onCsvErrorClick(file: any): void {
  this.crudService.repararCsv(file.name).subscribe({
    next: () => {
      file.csvStatus = 'pending';
      this.cdr.detectChanges(); 
    },
    error: (err) => console.error('Error', err)
  });
}

cleanFiles(): void{
  this.files = this.aux;
    this.filterFrom = '';
  this.filterTo = '';
}


onDateFilterChange(): void {
  if (!this.filterFrom || !this.filterTo) {
    // Si alguna fecha no está definida, restauramos la lista completa
    this.cleanFiles();
    return;
  }

  const fromDate = new Date(this.filterFrom);
  const toDate = new Date(this.filterTo);

  // Filtrado local
  this.files = this.aux.filter(file => {
    const fileDate = new Date(file.lastModified);
    return fileDate >= fromDate && fileDate <= toDate;
  });
}

  /** * Lógica para la previsualización de un archivo específico.
   * @param file Objeto del archivo a visualizar
   */
  handleView(file: any): void {
    console.log('Viewing file:', file.name);
  }

  /** * Gestiona la descarga de un archivo del listado.
   * @param file Objeto del archivo a descargar
   */
  handleDownload(file: any): void {
    console.log('Downloading file:', file.name);
  }
}