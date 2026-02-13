import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Activity, ShieldAlert, Zap, ChevronRight, Loader2, BrainCircuit, X, CheckCircle2, Clock
} from 'lucide-angular';
import { CRUD } from '../../service/Crud/crud';

/**
 * @component DataAnalyst
 * @description
 * Componente principal para el análisis de datos de IA. 
 * Se encarga de la visualización de modelos existentes, gestión de la cola de 
 * entrenamiento mediante polling y configuración de nuevos procesos.
 */
@Component({
  selector: 'app-data-analyst',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './data-analyst.html',
  styleUrl: './data-analyst.css',
})
export class DataAnalyst implements OnInit {
  
  // --- ICONOS (LUCIDE) ---
  /** Referencias de iconos para uso directo en el template HTML */
  readonly Activity = Activity;
  readonly ShieldAlert = ShieldAlert;
  readonly Zap = Zap;
  readonly ChevronRight = ChevronRight;
  readonly Loader2 = Loader2;
  readonly CheckCircle2 = CheckCircle2;
  readonly BrainCircuit = BrainCircuit;
  readonly X = X;
  readonly Clock = Clock;

  // --- VARIABLES DE ESTADO Y DATOS ---
  /** Almacena los metadatos de los modelos ya finalizados (provenientes de la tabla de modelos) */
  trainedModels: any[] = [];
  
  /** Lista de logs de entrenamiento. Nota: El backend maneja el postmeta en una tabla separada. */
  trainingQueue: any[] = [];
  
  /** Objeto de control para filtrar el dataset por fechas antes de entrenar */
  trainRange = { start: '', end: '' };
  
  // --- ESTADOS DE LA INTERFAZ (UI) ---
  /** Flag para mostrar/ocultar el modal de configuración */
  showTrainingModal = false;
  
  /** Estado de carga durante la comunicación con el servidor de IA */
  isTraining = false;
  
  /** Valor seleccionado: 'low', 'normal' o 'hardcore' */
  selectedTrainingEffort: string | null = null;

  /** * @constant trainingOptions
   * @description Opciones de configuración para el motor de IA. 
   */
  readonly trainingOptions = [
    { id: 'low', name: 'Ligero', desc: 'Análisis rápido con carga mínima.' },
    { id: 'normal', name: 'Balanceado', desc: 'Equilibrio óptimo tiempo/precisión.' },
    { id: 'hardcore', name: 'Profundo', desc: 'Máxima precisión de detección.' }
  ];

  constructor(
    private crud: CRUD,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * @lifecycle ngOnInit
   * Inicializa la vista cargando los modelos y el historial. 
   * Implementa un sistema de Polling cada 10 segundos.
   */
  ngOnInit() {
    this.loadModelsInfo();
    this.loadTrainingLog();
    
    // Polling de actualización automática
    setInterval(() => this.loadTrainingLog(), 10000);
  }

  // --- MÉTODOS DE CARGA DE DATOS (API) ---

  /**
   * @method loadModelsInfo
   * Consulta al servicio CRUD la información de los modelos disponibles.
   */
  loadModelsInfo() {
    this.crud.getModelsInfo().subscribe((resp: any[]) => {
      this.trainedModels = resp;
    });
  }

  /**
   * @method loadTrainingLog
   * Recupera la cola de procesos. Transforma el objeto del backend en un array 
   * y mapea las fases de entrenamiento para la visualización de progreso.
   */
  loadTrainingLog() {
    this.crud.getTrainingLog().subscribe((resp: any) => {
      this.trainingQueue = Object.keys(resp).map(key => {
        const item = resp[key];
        return {
          id: key,
          folder_name: item.folder_name,
          mode: item.mode,
          status: item.status,
          started_at: item.started_at,
          finished_at: item.finished_at,
          elapsed_sec: item.elapsed_sec,
          num_rows: item.num_rows,
          n_features: item.n_features,
          // Normalización de fases para la UI
          phases: this.mapPhases(item.phases)
        };
      }).reverse(); // Orden descendente (más nuevo arriba)
    });
  }

  // --- LÓGICA DE PROCESAMIENTO INTERNO ---

  /**
   * @method mapPhases
   * @private
   * @param {any} phasesObj - Objeto de fases crudo del backend.
   * @returns {Array} Lista estandarizada de fases con su estado actual.
   */
  private mapPhases(phasesObj: any) {
    const allPhases = [
      { key: 'inicio', label: 'Inicio' },
      { key: 'preprocessor', label: 'Preprocessor' },
      { key: 'transform', label: 'Transform' },
      { key: 'kmeans', label: 'KMeans' },
      { key: 'isoforest', label: 'Isoforest' }
    ];

    return allPhases.map(phase => {
      const serverPhase = phasesObj ? phasesObj[phase.key] : null;
      return {
        name: phase.label,
        status: serverPhase ? serverPhase.status : 'pending',
        time_sec: serverPhase ? serverPhase.time_sec : 0
      };
    });
  }

  /**
   * @method getPhaseIcon
   * @param {string} status - Estado de la fase ('done', 'running', 'pending').
   * @returns {LucideIcon} Icono correspondiente al estado.
   */
  getPhaseIcon(status: string) {
    if (status === 'done') return this.CheckCircle2;
    if (status === 'running') return this.Loader2;
    return this.Clock;
  }

  // --- ACCIONES DE USUARIO ---

  /** Activa el modal de entrenamiento */
  trainNewModel() {
    this.showTrainingModal = true;
  }

  /** Inicializa el rango de fechas a vacío y abre el modal para procesar todo el dataset */
  trainAllData() {
    this.trainRange = { start: '', end: '' }; 
    console.log("Iniciando entrenamiento global (Sin rango de fechas)");
    this.showTrainingModal = true;
  }

  /**
   * @method startTraining
   * Envía la orden de entrenamiento al servidor.
   * Realiza una limpieza de variables y refresca la UI tras un breve delay de UX.
   */
  startTraining() {
    if (!this.selectedTrainingEffort) return;
    
    this.isTraining = true;

    // Normalización de fechas para el payload (undefined si están vacías)
    const fDate = this.trainRange.start || undefined;
    const tDate = this.trainRange.end || undefined;

    this.crud.trainModels(this.selectedTrainingEffort, fDate, tDate).subscribe({
      next: (resp) => {
        console.log('Entrenamiento lanzado con éxito:', resp);
        
        // Delay visual para confirmar la acción al usuario
        setTimeout(() => {
          this.isTraining = false;
          this.showTrainingModal = false;
          this.selectedTrainingEffort = null;
          this.trainRange = { start: '', end: '' };
          
          this.loadTrainingLog(); // Refresco inmediato

          // Forzamos detección debido a que el cambio ocurre dentro de una zona asíncrona (setTimeout)
          this.cdr.detectChanges();
        }, 800);
      },
      error: (err) => {
        console.error('Error al lanzar entrenamiento:', err);
        this.isTraining = false;
        alert('Error al conectar con el servidor de IA');
      }
    });
  }
}