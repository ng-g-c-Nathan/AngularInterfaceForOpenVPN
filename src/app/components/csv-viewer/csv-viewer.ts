import { OnInit, Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CRUD } from '../../service/Crud/crud';
import { LucideAngularModule } from 'lucide-angular';
import { TrafficCsvListComponent } from '../traffic-csv-list-component/traffic-csv-list-component';

/**
 * Interface para gestionar la dirección y columna del ordenamiento de la tabla.
 */
type SortDirection = 'asc' | 'desc';
export interface TableSort {
  column: string;
  direction: SortDirection;
}

import {
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon, Zap, AlertTriangle, Settings, ChevronDown,
  BarChart3, FileText, FolderOpen, Clock, RefreshCw, Eye, Download, CheckCircle, AlertCircle, ChevronUp
} from 'lucide-angular';

/**
 * Componente CsvViewer
 * * Encargado de cargar, parsear y visualizar archivos CSV provenientes del backend.
 * * Soporta filtrado en tiempo real, ordenamiento inteligente y paginación.
 */
@Component({
  selector: 'app-csv-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TrafficCsvListComponent],
  templateUrl: './csv-viewer.html',
  styleUrls: ['../../../styles.css', './csv-viewer.css'],
})
export class CsvViewer implements OnInit {

  // --- ICONOS (LUCIDE) ---
  readonly Settings = Settings;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Zap = Zap;
  readonly FileText = FileText;
  readonly Search = Search;
  readonly RefreshCw = RefreshCw;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;

  // --- PROPIEDADES DE DATOS ---
  /** Ruta del archivo CSV obtenida por parámetros de URL */
  csvPath!: string;
  /** Contenido raw (texto plano) del archivo CSV */
  csvContent: string = '';
  /** Término de búsqueda introducido por el usuario */
  searchTerm: string = '';

  // --- ESTADO DE LA TABLA ---
  /** Configuración actual del ordenamiento */
  sort: TableSort = { column: '', direction: 'asc' };
  /** Índice de la página actual (basado en 0) */
  page = 0;
  /** Cantidad de registros a mostrar por página */
  pageSize = 5;

  /** Cabeceras extraídas de la primera línea del CSV */
  headers: string[] = [];
  /** Datos completos transformados a objetos JSON */
  rows: Array<Record<string, any>> = [];
  /** Filas que cumplen con el filtro de búsqueda y ordenamiento aplicado */
  filteredRows: Array<Record<string, any>> = [];

  /** Exponer Math al template para cálculos de paginación (ej: Math.ceil) */
  protected readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private crud: CRUD
  ) { }

  /**
   * Ciclo de vida: Escucha cambios en los parámetros de la URL para cargar el CSV correspondiente.
   */
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.csvPath = params['path'];
      if (this.csvPath) {
        this.loadCsvFromBackend(this.csvPath);
      }
    });
  }

  /**
   * Solicita el archivo CSV al servidor mediante el servicio CRUD.
   * @param path Ruta del recurso en el servidor.
   */
  private loadCsvFromBackend(path: string): void {
    this.crud.downloadCsv(path).subscribe({
      next: (text: string) => {
        this.csvContent = text;
        this.recomputeParsed();
        // Forzar detección de cambios tras la respuesta asíncrona
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error descargando CSV', err);
      }
    });
  }

  /**
   * Getter para obtener solo el segmento de filas correspondiente a la página actual.
   * Optimiza el rendimiento del loop *ngFor en el HTML.
   */
  get pagedRows(): Array<Record<string, any>> {
    const start = this.page * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  // --- LÓGICA DE PROCESAMIENTO ---

  /**
   * Transforma una cadena de texto CSV en una estructura de objetos manipulable.
   * @param content Texto plano del CSV.
   * @returns Un objeto con las cabeceras y un array de registros.
   */
  private parseCsv(content: string): { headers: string[]; rows: Array<Record<string, any>> } {
    if (!content || !content.trim()) return { headers: [], rows: [] };

    // Limpieza de líneas vacías y saltos de línea
    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return { headers: [], rows: [] };

    // Extracción de headers (asume delimitador por coma)
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Mapeo de líneas a objetos usando las cabeceras como llaves
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: Record<string, any> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] !== undefined ? values[i] : '';
      });
      return row;
    });

    return { headers, rows };
  }

  /**
   * Orquestador que dispara el parseo inicial y la lógica de filtrado/ordenado.
   */
  private recomputeParsed(): void {
    const parsed = this.parseCsv(this.csvContent);
    this.headers = parsed.headers;
    this.rows = parsed.rows;
    this.recomputeFiltered();
  }

  /**
   * Aplica los filtros de búsqueda y las reglas de ordenamiento sobre los datos.
   * Resetea la paginación a 0 para evitar inconsistencias visuales.
   */
  recomputeFiltered(): void {
    let result = [...this.rows];

    // 1. Lógica de Filtrado Global
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(term)
        )
      );
    }

    // 2. Ordenación Inteligente (Diferencia tipos numéricos de strings)
    if (this.sort.column) {
      result.sort((a, b) => {
        const aVal = a[this.sort.column];
        const bVal = b[this.sort.column];

        const aNum = Number(aVal);
        const bNum = Number(bVal);

        let comparison: number;
        // Si ambos son números, orden numérico (1, 2, 10...)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum;
        } else {
          // Si son strings, orden alfabético local
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return this.sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredRows = result;
    this.page = 0; 
  }

  // --- HANDLERS DE INTERFAZ (UI) ---

  /**
   * Gestiona el evento de clic en las cabeceras de la tabla para ordenar.
   * @param column Nombre de la columna a ordenar.
   */
  handleSort(column: string): void {
    this.sort = {
      column,
      direction: this.sort.column === column && this.sort.direction === 'asc' ? 'desc' : 'asc',
    };
    this.recomputeFiltered();
  }

  /**
   * Captura el input de búsqueda y actualiza la tabla.
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.recomputeFiltered();
  }

  /** Avanza a la siguiente página de resultados */
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filteredRows.length) {
      this.page++;
    }
  }

  /** Retrocede a la página anterior */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }
}