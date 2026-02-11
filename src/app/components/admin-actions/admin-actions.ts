import { CommonModule } from '@angular/common';
import { Component,Output,EventEmitter } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CRUD } from '../../service/Crud/crud';
import { ChangeDetectorRef } from '@angular/core';
import { App } from '../../app';
import { 
  X, Menu, Activity, GlobeIcon, MenuIcon, ActivityIcon, Trash2, Search,
  ChevronLeftIcon, ShieldCheckIcon, FileIcon, Users, ChevronRightIcon,Zap,AlertTriangle,Settings,
  BarChart3, FileText, FolderOpen, Clock, RefreshCw, Eye, Download, CheckCircle,AlertCircle,
  LucideAngularComponent
} from 'lucide-angular';
@Component({
  selector: 'app-admin-actions',
  imports: [CommonModule,LucideAngularModule],
  templateUrl: './admin-actions.html',
  styleUrl: './admin-actions.css',
})
export class AdminActions {
@Output() commandExecuted = new EventEmitter<void>();
  readonly Settings = Settings;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Zap = Zap;

    constructor(private crud: CRUD, private cdr: ChangeDetectorRef,private padre:App) {}

    
commands: any[] = [
  { id: 1, name: 'Detener Servidor VPN', api: 'stop', description: 'Detiene el servidor VPN.', icon: 'Square', dangerous: true },
  { id: 2, name: 'Reiniciar Servidor VPN', api: 'restart', description: 'Reinicia todos los servicios VPN.', icon: 'RotateCw', dangerous: true },
  { id: 3, name: 'Iniciar Servidor VPN', api: 'start', description: 'Inicia el servidor VPN.', icon: 'Play', dangerous: false },
];


  selectedCommand: any = null;
  isExecuting: boolean = false;
  lastResult: any = null;

  selectCommand(command: any) {
    this.selectedCommand = command;
  }

handleExecute() {
  if (!this.selectedCommand) return;

  this.isExecuting = true;

  this.crud.executeVpnCommand(this.selectedCommand.api).subscribe({
    next: (res: any) => {
      this.lastResult = {
        success: res.status === 'success',
        message: res.message || `Comando "${this.selectedCommand.name}" ejecutado correctamente.`,
        output: res.output || '',
        timestamp: new Date().toISOString(),
      };
      this.isExecuting = false;

      const executedCommand = this.selectedCommand.name;
      this.selectedCommand = null; 
      this.padre.checkSystemStatus();
      this.commandExecuted.emit(); 
      this.cdr.detectChanges(); 

    },
    error: (err) => {
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


  closeResult() {
    this.lastResult = null;
  }

  cancelCommand() {
    this.selectedCommand = null;
  }
}