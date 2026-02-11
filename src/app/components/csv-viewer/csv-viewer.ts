import { OnInit, Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)] del selector de página
import { CRUD } from '../../service/Crud/crud';
import { LucideAngularModule } from 'lucide-angular';
import { TrafficCsvListComponent } from '../traffic-csv-list-component/traffic-csv-list-component';
type SortDirection = 'asc' | 'desc';

export interface TableSort {
  column: string;
  direction: SortDirection;
}
import {
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon, Zap, AlertTriangle, Settings, ChevronDown,
  BarChart3, FileText, FolderOpen, Clock, RefreshCw, Eye, Download, CheckCircle, AlertCircle, ChevronUp,
  LucideAngularComponent
} from 'lucide-angular';
@Component({
  selector: 'app-csv-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule,LucideAngularModule,TrafficCsvListComponent],
  templateUrl: './csv-viewer.html',
  styleUrls: ['../../../styles.css', './csv-viewer.css'],
})
export class CsvViewer implements OnInit {

  // Referencias de iconos para la UI
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


  csvPath!: string;
  csvContent: string = '';
  searchTerm: string = '';

  // Estado de Tabla
  sort: TableSort = { column: '', direction: 'asc' };
  page = 0;
  pageSize = 5;

  headers: string[] = [];
  rows: Array<Record<string, any>> = [];
  filteredRows: Array<Record<string, any>> = [];

  // Exponer Math al template para cálculos de paginación
  protected readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private crud: CRUD
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.csvPath = params['path'];
      if (this.csvPath) {
        this.loadCsvFromBackend(this.csvPath);
      }
    });
  }

  private loadCsvFromBackend(path: string): void {
    this.crud.downloadCsv(path).subscribe({
      next: (text: string) => {
        this.csvContent = text;
        this.recomputeParsed();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error descargando CSV', err);
      }
    });
  }

  /**
   * Getter para obtener solo las filas de la página actual
   * Esto evita procesar arrays gigantes en el loop del HTML
   */
  get pagedRows(): Array<Record<string, any>> {
    const start = this.page * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  // --- Lógica de Procesamiento ---

  private parseCsv(content: string): { headers: string[]; rows: Array<Record<string, any>> } {
    if (!content || !content.trim()) return { headers: [], rows: [] };

    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
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

  private recomputeParsed(): void {
    const parsed = this.parseCsv(this.csvContent);
    this.headers = parsed.headers;
    this.rows = parsed.rows;
    this.recomputeFiltered();
  }

  recomputeFiltered(): void {
    let result = [...this.rows];

    // 1. Filtrado
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(term)
        )
      );
    }

    // 2. Ordenación Inteligente (Números vs Strings)
    if (this.sort.column) {
      result.sort((a, b) => {
        const aVal = a[this.sort.column];
        const bVal = b[this.sort.column];

        // Intento de conversión a número para orden lógico (1, 2, 10 en vez de 1, 10, 2)
        const aNum = Number(aVal);
        const bNum = Number(bVal);

        let comparison: number;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return this.sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredRows = result;
    this.page = 0; // Resetear a la primera página tras filtrar u ordenar
  }

  // --- Handlers de Interfaz ---

  handleSort(column: string): void {
    this.sort = {
      column,
      direction: this.sort.column === column && this.sort.direction === 'asc' ? 'desc' : 'asc',
    };
    this.recomputeFiltered();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.recomputeFiltered();
  }

  // Navegación
  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filteredRows.length) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
    }
  }
}