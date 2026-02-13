import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CRUD } from '../../service/Crud/crud';
import { ChangeDetectorRef } from '@angular/core';
import { App } from '../../app';
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon, Zap, AlertTriangle, Settings,
  BarChart3, FileText, FolderOpen, Clock, RefreshCw, Eye, Download, CheckCircle, AlertCircle,
  LucideAngularComponent
} from 'lucide-angular';

/**
 * Componente AdminActions
 * * Gestiona la ejecución de comandos críticos del servidor VPN (Iniciar, Detener, Reiniciar).
 * * Incluye un flujo de confirmación para acciones peligrosas y feedback de ejecución en tiempo real.
 */
@Component({
  selector: 'app-admin-actions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-actions.html',
  styleUrl: './admin-actions.css',
})
export class AdminActions {
  /** Emite un evento cuando un comando se ha completado con éxito para notificar a otros componentes */
  @Output() commandExecuted = new EventEmitter<void>();

  // --- ICONOS (LUCIDE) ---
  readonly Settings = Settings;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Zap = Zap;

  /** * Listado de comandos disponibles para el administrador.
   * 'dangerous: true' activa advertencias visuales en la interfaz.
   */
  commands: any[] = [
    { id: 1, name: 'Detener Servidor VPN', api: 'stop', description: 'Detiene el servidor VPN.', icon: 'Square', dangerous: true },
    { id: 2, name: 'Reiniciar Servidor VPN', api: 'restart', description: 'Reinicia todos los servicios VPN.', icon: 'RotateCw', dangerous: true },
    { id: 3, name: 'Iniciar Servidor VPN', api: 'start', description: 'Inicia el servidor VPN.', icon: 'Play', dangerous: false },
  ];

  // --- ESTADOS DE LA INTERFAZ (UI) ---
  /** Almacena el comando que el usuario ha seleccionado para ejecutar/confirmar */
  selectedCommand: any = null;
  /** Indica si hay una petición HTTP de ejecución de comando en proceso */
  isExecuting: boolean = false;
  /** Guarda el resultado (éxito/error) de la última operación realizada */
  lastResult: any = null;

  constructor(
    private crud: CRUD, 
    private cdr: ChangeDetectorRef,
    private padre: App // Referencia al componente principal para actualizar el estado global
  ) {}

  // --- MÉTODOS DE INTERACCIÓN ---

  /**
   * Selecciona un comando de la lista para mostrar el diálogo de confirmación.
   * @param command Objeto del comando seleccionado.
   */
  selectCommand(command: any) {
    this.selectedCommand = command;
  }

  /**
   * Envía la instrucción de ejecución al servidor a través del servicio CRUD.
   * Maneja el flujo de carga, el cierre de modales y la actualización del estado del sistema.
   */
  handleExecute() {
    if (!this.selectedCommand) return;

    this.isExecuting = true;

    this.crud.executeVpnCommand(this.selectedCommand.api).subscribe({
      next: (res: any) => {
        // Estructura del resultado exitoso
        this.lastResult = {
          success: res.status === 'success',
          message: res.message || `Comando "${this.selectedCommand.name}" ejecutado correctamente.`,
          output: res.output || '',
          timestamp: new Date().toISOString(),
        };

        this.isExecuting = false;
        this.selectedCommand = null; 

        // Actualiza el estado visual en el componente padre (ej. indicadores de "Online/Offline")
        this.padre.checkSystemStatus();
        
        // Notifica a otros componentes interesados
        this.commandExecuted.emit(); 
        
        // Fuerza la detección de cambios para reflejar el estado del servidor de inmediato
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        // Manejo de errores de red o del servidor
        this.lastResult = {
          success: false,
          message: `Error al ejecutar "${this.selectedCommand.name}". ${err?.message || ''}`,
          output: err?.error?.message || '',
          timestamp: new Date().toISOString(),
        };
        this.isExecuting = false;
        this.selectedCommand = null;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Limpia el mensaje de resultado de la pantalla.
   */
  closeResult() {
    this.lastResult = null;
  }

  /**
   * Cancela la selección actual y cierra el diálogo de confirmación.
   */
  cancelCommand() {
    this.selectedCommand = null;
  }
}