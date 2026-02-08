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
}
