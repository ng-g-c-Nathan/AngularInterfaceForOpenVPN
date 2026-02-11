import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Activity, ShieldAlert, BarChart3, Zap, ChevronRight } from 'lucide-angular';
@Component({
  selector: 'app-data-analyst',
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './data-analyst.html',
  styleUrl: './data-analyst.css',
})
export class DataAnalyst {// Íconos
  readonly Activity = Activity;
  readonly ShieldAlert = ShieldAlert;
  readonly BarChart3 = BarChart3;
  readonly Zap = Zap;

  // Estados del flujo
  step: 'INITIAL' | 'MODE_SELECTION' | 'CONFIG_USUAL' | 'SHOW_ATTACKS' | 'RESULTS' = 'INITIAL';

  // Variables de configuración
  analysisConfig = {
    range: 'yesterday',
    compareAgainst: '7d'
  };

  // Mocks de ataques
  attackMocks = [
    { type: 'DDoS SYN Flood', severity: 'CRITICAL', source: '192.168.1.105', time: '10:45 PM' },
    { type: 'Brute Force SSH', severity: 'HIGH', source: '45.128.2.12', time: '09:12 PM' },
    { type: 'Port Scan Detection', severity: 'MEDIUM', source: '10.0.0.50', time: '08:30 PM' }
  ];

  selectMode(mode: 'USUAL' | 'ATTACKS') {
    if (mode === 'USUAL') {
      this.step = 'CONFIG_USUAL';
    } else {
      this.step = 'SHOW_ATTACKS';
    }
  }

  runAnalysis() {
    console.log('Iniciando análisis con:', this.analysisConfig);
    // Aquí iría tu llamada al servicio CRUD
    this.step = 'RESULTS';
  }

  resetAnalysis() {
    this.step = 'INITIAL';
  }
}