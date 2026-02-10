import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CRUD } from '../../service/Crud/crud';
import { App } from '../../app';

// Importación de iconos Lucide para acciones administrativas y estados
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon, Zap, AlertTriangle, Settings,
  BarChart3, FileText, FolderOpen, Clock, RefreshCw, Eye, Download, CheckCircle, AlertCircle,
  LucideAngularComponent
} from 'lucide-angular';

@Component({
  selector: 'app-admin-actions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-actions.html',
  styleUrl: './admin-actions.css',
})
export class AdminActions {
  /** Evento emitido tras la ejecución exitosa de un comando */
  @Output() commandExecuted = new EventEmitter<void>();

  // Referencias de iconos para la UI
  readonly Settings = Settings;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Zap = Zap;

  /** * Definición de comandos disponibles.
   * 'dangerous: true' se utiliza para mostrar advertencias visuales en la interfaz.
   */
  commands: any[] = [
    { id: 1, name: 'Detener Servidor VPN', api: 'stop', description: 'Detiene el servidor VPN.', icon: 'Square', dangerous: true },
    { id: 2, name: 'Reiniciar Servidor VPN', api: 'restart', description: 'Reinicia todos los servicios VPN.', icon: 'RotateCw', dangerous: true },
    { id: 3, name: 'Iniciar Servidor VPN', api: 'start', description: 'Inicia el servidor VPN.', icon: 'Play', dangerous: false },
  ];

  // Estados de control para el flujo de ejecución
  selectedCommand: any = null;
  isExecuting: boolean = false;
  lastResult: any = null;

  constructor(
    private crud: CRUD, 
    private cdr: ChangeDetectorRef,
    private padre: App // Referencia al componente principal para actualizar el estado global
  ) {}

  /** Prepara un comando para su confirmación/ejecución */
  selectCommand(command: any) {
    this.selectedCommand = command;
  }

  /** * Ejecuta el comando seleccionado a través del servicio CRUD.
   * Al finalizar, actualiza el estado del sistema en el componente padre.
   */
  handleExecute() {
    if (!this.selectedCommand) return;

    this.isExecuting = true;

    this.crud.executeVpnCommand(this.selectedCommand.api).subscribe({
      next: (res: any) => {
        // Estructuración del resultado exitoso
        this.lastResult = {
          success: res.status === 'success',
          message: res.message || `Comando "${this.selectedCommand.name}" ejecutado correctamente.`,
          output: res.output || '',
          timestamp: new Date().toISOString(),
        };
        
        this.finishExecution();
      },
      error: (err) => {
        // Estructuración del mensaje de error
        this.lastResult = {
          success: false,
          message: `Error al ejecutar "${this.selectedCommand.name}". ${err?.message || ''}`,
          output: err?.error?.message || '',
          timestamp: new Date().toISOString(),
        };
        
        this.finishExecution();
      }
    });
  }

  /** Limpia estados y sincroniza la vista tras la respuesta de la API */
  private finishExecution() {
    this.isExecuting = false;
    this.selectedCommand = null; 
    
    // Sincronización con el Dashboard global
    this.padre.checkSystemStatus();
    this.commandExecuted.emit(); 
    
    // Forzar detección de cambios por si la respuesta viene fuera del ciclo estándar
    this.cdr.detectChanges(); 
  }

  /** Cierra el panel de resultados de la operación */
  closeResult() {
    this.lastResult = null;
  }

  /** Cancela la selección actual del comando */
  cancelCommand() {
    this.selectedCommand = null;
  }
}