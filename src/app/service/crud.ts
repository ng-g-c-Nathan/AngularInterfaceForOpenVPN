import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient para hacer solicitudes HTTP
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CRUD {
  private API = 'http://192.168.0.167:8080/api';

  constructor(private clienteHttp: HttpClient) { }



  getDashboard(): Observable<any> {
    return this.clienteHttp.get(`${this.API}/dashboard`);
  }

  getTrafficCsvListComponent(): Observable<any> {
    return this.clienteHttp.get(`${this.API}/csv_files`);
  }

  repararCsv(filename: string): Observable<any> {
  const url = `${this.API}/csv_files/reparar/${encodeURIComponent(filename)}`;
  return this.clienteHttp.post(url, null);
}

getTrafficRange(from: string, to: string): Observable<any> {
  // Convertimos el string de datetime-local a solo fecha ISO
  const fromDate = from.split('T')[0]; // "2026-02-08T15:40" -> "2026-02-08"
  const toDate   = to.split('T')[0];
  console.log(
    `${this.API}/traffic/range`,
    { params: { from: fromDate, to: toDate } }
  );
  return this.clienteHttp.get(
    `${this.API}/traffic/range`,
    { params: { from: fromDate, to: toDate } }
  );
}

}
