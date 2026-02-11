import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Activity, ShieldAlert, BarChart3, Zap, BrainCircuit, ShieldCheck } from 'lucide-angular';
@Component({
  selector: 'app-train-amodel',
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './train-amodel.html',
  styleUrl: './train-amodel.css',
})
export class TrainAModel {
// Íconos para la UI
  readonly Activity = Activity;
  readonly ShieldAlert = ShieldAlert;
  readonly BarChart3 = BarChart3;
  readonly Zap = Zap;
  readonly BrainCircuit = BrainCircuit;

  // --- VARIABLES DE ESTADO DE ENTRENAMIENTO ---
  isTrained: boolean = false; 
  isTraining: boolean = false;
  selectedTrainingEffort: string | null = null;

  trainingOptions = [
  { 
    id: 'fast', 
    name: 'Ligero', 
    desc: 'Análisis rápido con carga mínima de CPU.' 
  },
  { 
    id: 'balanced', 
    name: 'Balanceado', 
    desc: 'Equilibrio óptimo entre tiempo y detección.' 
  },
  { 
    id: 'deep', 
    name: 'Profundo', 
    desc: 'Máxima precisión, requiere mayor cómputo.' 
  }
];

  // --- VARIABLES DE FLUJO DE ANÁLISIS ---
  step: 'INITIAL' | 'MODE_SELECTION' | 'CONFIG_USUAL' | 'SHOW_ATTACKS' | 'RESULTS' = 'INITIAL';

  analysisConfig = {
    range: 'yesterday',
    compareAgainst: '7d'
  };

  // --- MOCKS ---
  attackMocks = [
    { type: 'DDoS SYN Flood', severity: 'CRITICAL', source: '185.210.45.1', time: 'hace 5m' },
    { type: 'SSH Brute Force', severity: 'HIGH', source: '201.12.89.44', time: 'hace 12m' },
    { type: 'Port Scan (Nmap)', severity: 'LOW', source: '10.0.0.15', time: 'hace 1h' }
  ];

  // --- LÓGICA ---
  
  startTraining() {
    if (!this.selectedTrainingEffort) return;
    
    this.isTraining = true;
    
    // Simulación de entrenamiento (Mock)
    setTimeout(() => {
      this.isTraining = false;
      this.isTrained = true;
      this.step = 'INITIAL';
      console.log(`Modelo entrenado con esfuerzo: ${this.selectedTrainingEffort}`);
    }, 3000); 
  }

  runAnalysis() {
    console.log('Ejecutando con configuración:', this.analysisConfig);
    alert('Iniciando análisis profundo...');
  }

  resetAnalysis() {
    this.step = 'INITIAL';
  }
}