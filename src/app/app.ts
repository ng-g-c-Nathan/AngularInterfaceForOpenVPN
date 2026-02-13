import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgZone } from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { CRUD } from './service/Crud/crud';
// Importación masiva de iconos para su uso en el template
import {
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon,Zap,BrainCircuit,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users,
  BarChart3, FileText, FolderOpen, Clock, Settings
} from 'lucide-angular';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-root',
  standalone: true, // Asumido por el uso de imports directos
  imports: [RouterOutlet, LucideAngularModule, CommonModule, RouterLink, RouterLinkActive,],
  templateUrl: './app.html',
  styleUrls: ['./app.css', '../styles.css']
})
export class App {
  // Signal para el título: mejor rendimiento en Angular 
  protected readonly title = signal('Conqueror');

  // Estado del sistema (inicializado con valores por defecto)
  systemStatus = signal({
    active: 'inactive',
    since: '--',
    pid: '--'
  });

  // Referencias manuales de iconos para que el HTML pueda acceder a ellos
  readonly FileIcon = FileIcon;
  readonly X = X;
  readonly Menu = Menu;
  readonly Activity = Activity;
  readonly GlobeIcon = GlobeIcon;
  readonly MenuIcon = MenuIcon;
  readonly ActivityIcon = ActivityIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly Zap = Zap;

  // Estado de comunicación con otros componentes
  @Input() activeSection: string = '';
  @Output() sectionChange = new EventEmitter<string>();

  // Control de visibilidad de la interfaz
  sidebarOpen: boolean = true;

  /**
   * Configuración de los ítems de navegación.
   * Centralizar esto aquí facilita añadir nuevas secciones en el futuro.
   */
  readonly navItems: NavItem[] = [
    { id: 'traffic', label: 'Tráfico por Días', icon: BarChart3 },
    { id: 'csv', label: 'Visualizar CSV', icon: FileText },
    { id: 'data', label: 'Análisis de Datos', icon: Activity }, 
    { id: 'monitor', label: 'Monitor de Análisis', icon: Zap }, 
    { id: 'auto', label: 'Tráfico Automático', icon: Clock },
    { id: 'admin', label: 'Comandos Admin', icon: Settings },
  
  ];


  isLoading: boolean = true;

  // Inyectamos el servicio en el constructor
  constructor(private crudService: CRUD, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.checkSystemStatus();
  }

  /** Llama a la API y actualiza el estado */
  checkSystemStatus(): void {
    this.crudService.getDashboard().subscribe({
      next: (data) => {
        // 2. Actualiza el signal usando .set()
        this.systemStatus.set({
          active: data.active,
          since: data.since,
          pid: data.main_pid
        });
      },
      error: (err) => console.error('Error:', err)
    });
  }

  /** Alterna el estado del menú lateral */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /** Cierra explícitamente el menú */
  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  /** Notifica al componente padre sobre el cambio de sección */
  handleSectionChange(id: string): void {
    console.log('Cambiando a:', id);
    this.sectionChange.emit(id);
  }

  /** * Obtiene el nombre amigable de la sección activa 
   * @returns string con el label o cadena vacía si no hay coincidencia
   */
  getActiveLabel(): string {
    const active = this.navItems.find(item => item.id === this.activeSection);
    return active ? active.label : '';
  }
}