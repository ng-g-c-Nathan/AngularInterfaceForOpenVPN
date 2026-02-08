import { Component, OnDestroy, OnInit } from '@angular/core';
import { CRUD } from '../../service/crud';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Importación de iconos específicos para la interfaz de archivos
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, 
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, 
  BarChart3, FileText, FolderOpen, Clock, Settings, RefreshCw, Eye, Download 
} from 'lucide-angular';

@Component({
  selector: 'app-traffic-csv-list-component',
  imports: [LucideAngularModule, FormsModule, CommonModule],
  templateUrl: './traffic-csv-list-component.html',
  styleUrl: './traffic-csv-list-component.css',
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
  readonly Download = Download;
  
  // Estado local del componente
  files: any[] = [];
  isLoading: boolean = true;
  lastUpdate: Date = new Date();
  autoRefresh: boolean = true;

  // Inyección del servicio de datos
  constructor(private crudService: CRUD) {}

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
          //console.log(data);
          this.files = data.map((file: any) => ({
            name: file.name,
            lastModified: new Date(file.lastModified),
            size: file.size,
            csvExists: file.csvExists
          }));
          this.lastUpdate = new Date();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener los archivos CSV:', err);
          this.isLoading = false;
        }
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