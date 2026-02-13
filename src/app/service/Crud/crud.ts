import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

/**
 * Servicio CRUD
 * Proporciona los métodos de comunicación con la API para la gestión de tráfico,
 * archivos CSV, comandos de VPN y entrenamiento de modelos de IA.
 */
@Injectable({
  providedIn: 'root',
})
export class CRUD {
  /** URL base del servidor API (Cambiar según el entorno de red) */
  private API = 'http://192.168.0.167:8080/api';

  constructor(private clienteHttp: HttpClient) { }

  // --- MÉTODOS DE PANEL Y ESTADÍSTICAS ---

  /** Obtiene los datos generales para el tablero principal */
  getDashboard(): Observable<any> {
    return this.clienteHttp.get(`${this.API}/dashboard`);
  }

  /** Recupera el historial de registros de tráfico analizados */
  getTrafficHistory(): Observable<any> {
    return this.clienteHttp.get(`${this.API}/traffic/history`);
  }

  // --- GESTIÓN DE ARCHIVOS CSV ---

  /** Lista todos los archivos CSV de tráfico disponibles en el servidor */
  getTrafficCsvListComponent(): Observable<any> {
    return this.clienteHttp.get(`${this.API}/csv_files`);
  }

  /**
   * Intenta corregir errores de formato en un archivo CSV específico.
   * @param filename Nombre del archivo a reparar.
   */
  repararCsv(filename: string): Observable<any> {
    const url = `${this.API}/csv_files/reparar/${encodeURIComponent(filename)}`;
    return this.clienteHttp.post(url, null);
  }

  /**
   * Descarga el contenido de un archivo CSV en formato de texto.
   * @param csvFile Nombre del archivo.
   */
  downloadCsv(csvFile: string) {
    return this.clienteHttp.post(
      `${this.API}/csv_files/download`,
      { CSVFILE: csvFile },
      { responseType: 'text' }
    );
  }

  // --- ANÁLISIS Y FILTRADO ---

  /**
   * Obtiene registros de tráfico filtrados por un rango de fechas.
   * @param from Fecha de inicio (format HTML datetime-local).
   * @param to Fecha de fin (format HTML datetime-local).
   */
  getTrafficRange(from: string, to: string): Observable<any> {
    // Normalización: Extraemos solo la parte de la fecha YYYY-MM-DD
    const fromDate = from.split('T')[0]; 
    const toDate = to.split('T')[0];
    
    return this.clienteHttp.get(
      `${this.API}/traffic/range`,
      { params: { from: fromDate, to: toDate } }
    );
  }

  /**
   * Ejecuta un proceso de 'scoring' (clasificación) sobre un archivo CSV.
   * @param filename Nombre del archivo a procesar por la IA.
   */
  scoreTraffic(filename: string): Observable<any> {
    return this.clienteHttp.post(`${this.API}/traffic/score`, {
      CSVFILE: filename
    });
  }

  // --- ENTRENAMIENTO DE IA Y MODELOS ---

  /** Obtiene la bitácora de estados de los procesos de entrenamiento */
  getTrainingLog(): Observable<any> {
    return this.clienteHttp.get(
      `${this.API}/traffic/training_log`,
      { responseType: 'json' }
    );
  }

  /** Obtiene metadatos de los modelos entrenados (versiones, precisión, etc.) */
  getModelsInfo(): Observable<any> {
    return this.clienteHttp.get(
      `${this.API}/traffic/models_info`,
      { responseType: 'json' }
    );
  }

  /**
   * Lanza una petición para entrenar nuevos modelos de detección.
   * @param mode Nivel de intensidad/esfuerzo del entrenamiento.
   * @param fromDate Fecha opcional de inicio para el dataset.
   * @param toDate Fecha opcional de fin para el dataset.
   */
  trainModels(mode: string, fromDate?: string, toDate?: string): Observable<any> {
    const body: any = { mode };

    if (fromDate) body.fromDate = fromDate;
    if (toDate) body.toDate = toDate;

    return this.clienteHttp.post(
      `${this.API}/traffic/train`,
      body
    );
  }

  // --- COMANDOS DE RED ---

  /**
   * Envía instrucciones de control al servicio VPN.
   * @param command Comando específico a ejecutar (ej: start, stop).
   */
  executeVpnCommand(command: string): Observable<any> {
    return this.clienteHttp.post(
      `${this.API}/vpn/execute`,
      null,
      { params: { command } }
    );
  }
}