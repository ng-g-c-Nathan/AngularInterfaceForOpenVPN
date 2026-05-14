import { Subject, takeUntil } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

import { CRUD } from '../../service/Crud/crud';
import { LucideAngularModule } from 'lucide-angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Search,
  RefreshCw, AlertCircle, ChevronRightIcon, ChevronLeftIcon, UserX,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-angular';

//  Interfaces 

// Posibles estados de un usuario VPN
export type VpnStatus = 'online' | 'offline' | 'revoked';
// Grupos de acceso disponibles en el servidor VPN
export type VpnGroup  = 'admin' | 'dev' | 'ops' | 'guest';
// Protocolo de conexión del cliente
export type VpnProto  = 'UDP' | 'TCP';

/** Representa un cliente VPN con todos sus metadatos de conexión y tráfico */
export interface VpnUser {
  id:              number;
  username:        string;
  cn:              string;         // Common Name del certificado
  group:           VpnGroup;
  status:          VpnStatus;
  proto:           VpnProto;
  ip_vpn:          string;         // IP asignada dentro del túnel VPN
  ip_real:         string;         // IP pública del cliente
  bytes_rx:        number;
  bytes_tx:        number;
  connected_since: string | null;
  last_seen:       string | null;
  cert_exp:        string;         // Fecha de expiración del certificado
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, PercentPipe,
            LucideAngularModule, RouterModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit, OnDestroy {

  // Referencias manuales de iconos para que el HTML pueda acceder a ellos
  readonly Search           = Search;
  readonly RefreshCw        = RefreshCw;
  readonly AlertCircle      = AlertCircle;
  readonly Eye              = Eye;
  readonly UserX            = UserX;
  readonly Trash2           = Trash2;
  readonly ChevronLeftIcon  = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ChevronLeft      = ChevronLeft;
  readonly ChevronRight     = ChevronRight;
  readonly Math             = Math;   // Expuesto para usarlo directamente en el template

  //  Estado de la UI 

  isLoading       = false;
  errorMsg        = '';
  // ID del usuario cuya fila de detalle está expandida (null = ninguno)
  selectedUserId: number | null = null;

  //  Datos 

  allUsers:      VpnUser[] = [];   // Lista completa recibida del API
  filteredUsers: VpnUser[] = [];   // Lista tras aplicar filtros activos
  pagedUsers:    VpnUser[] = [];   // Subconjunto visible en la página actual

  //  Filtros 

  filterSearch = '';
  filterStatus = '';
  filterGroup  = '';
  filterProto  = '';

  //  Paginación 

  page       = 0;
  pageSize   = 10;
  totalPages = 1;

  //  Estadísticas del panel superior 

  statTotal   = 0;
  statOnline  = 0;
  statOffline = 0;
  statRevoked = 0;
  statTraffic = '';   // Tráfico total formateado (KB / MB / GB)

  // Máximo de bytes entre todos los usuarios; sirve de base para las barras de progreso
  maxBytes = 1;

  // Subject usado para cancelar todas las suscripciones al destruir el componente
  private destroy$ = new Subject<void>();
  // Referencia al intervalo de auto-refresco para poder limpiarlo en ngOnDestroy
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private crud: CRUD) {}

  ngOnInit(): void {
    this.refreshUsers();
    // Auto-refresco cada 30 s para mantener el estado sincronizado con el servidor
    this.refreshInterval = setInterval(() => this.refreshUsers(), 30_000);
  }

  ngOnDestroy(): void {
    // Cancelamos suscripciones activas y limpiamos el intervalo al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  //  Carga de datos desde la API 

  /** Solicita la lista de clientes al backend y actualiza la vista */
  refreshUsers(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    this.crud.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients: any[]) => {
          this.allUsers = clients.map((c, i) => this.mapClient(c, i));
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMsg = 'No se pudo conectar con el servidor VPN.';
          this.isLoading = false;
          // Si el API falla dejamos la lista vacía para evitar datos obsoletos
          this.allUsers = [];
          this.applyFilters();
        }
      });
  }

  /**
   * Mapea la respuesta del ClientController (Spring) al modelo VpnUser del UI.
   * Spring devuelve: commonName, realAddress, virtualAddress,
   *                  bytesReceived, bytesSent, connectedSince, status
   * @param c     - Objeto raw devuelto por el API (snake_case o camelCase)
   * @param index - Índice del elemento; se usa para generar un ID local
   */
  private mapClient(c: any, index: number): VpnUser {
    return {
      id:              index + 1,
      username:        c.commonName ?? c.common_name ?? `client-${index + 1}`,
      cn:              c.commonName ?? c.common_name ?? `Cliente ${index + 1}`,
      group:           'guest',           // OpenVPN no provee grupo — default guest
      status:          (c.status ?? 'online') as VpnStatus,
      proto:           'UDP',             // El server.conf usa UDP por defecto
      ip_vpn:          c.virtualAddress  ?? c.virtual_address  ?? '—',
      ip_real:         c.realAddress     ?? c.real_address     ?? '—',
      bytes_rx:        c.bytesReceived   ?? c.bytes_received   ?? 0,
      bytes_tx:        c.bytesSent       ?? c.bytes_sent       ?? 0,
      connected_since: c.connectedSince  ?? c.connected_since  ?? null,
      last_seen:       c.connectedSince  ?? c.connected_since  ?? null,
      cert_exp:        '—',              // No disponible en status.log
    };
  }

  //  Filtros y paginación 

  /** Recalcula filteredUsers a partir de allUsers y reinicia a la primera página */
  applyFilters(): void {
    const q = this.filterSearch.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter(u => {
      if (q && !u.username.toLowerCase().includes(q)
             && !u.cn.toLowerCase().includes(q)
             && !u.ip_vpn.includes(q)
             && !u.ip_real.includes(q)) return false;
      if (this.filterStatus && u.status !== this.filterStatus) return false;
      if (this.filterGroup  && u.group  !== this.filterGroup)  return false;
      if (this.filterProto  && u.proto  !== this.filterProto)  return false;
      return true;
    });
    this.page = 0;
    this.updateStats();
    this.paginate();
  }

  /** Limpia todos los filtros activos y recarga la lista completa */
  clearFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterGroup  = '';
    this.filterProto  = '';
    this.applyFilters();
  }

  /** Expande o contrae la fila de detalle del usuario con el id dado */
  toggleUser(id: number): void {
    this.selectedUserId = this.selectedUserId === id ? null : id;
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.paginate(); } }
  nextPage(): void { if (this.page + 1 < this.totalPages) { this.page++; this.paginate(); } }

  //  Helpers de display 

  /**
   * Genera las iniciales de un nombre para el avatar de usuario.
   * @returns Máximo 2 letras en mayúsculas
   */
  getInitials(cn: string): string {
    return cn.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /**
   * Convierte bytes a una cadena legible (KB / MB / GB).
   * @returns String formateado con la unidad correspondiente
   */
  formatBytes(bytes: number): string {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    return (bytes / 1e3).toFixed(0) + ' KB';
  }

  /** Porcentaje de la barra RX relativo al usuario con más tráfico (0-100) */
  rxBarPct(u: VpnUser): number {
    return Math.min(Math.round((u.bytes_rx / this.maxBytes) * 100), 100);
  }

  /** Porcentaje de la barra TX relativo al usuario con más tráfico (0-100) */
  txBarPct(u: VpnUser): number {
    return Math.min(Math.round((u.bytes_tx / this.maxBytes) * 100), 100);
  }

  /** Clase Tailwind para el indicador lateral de color según el estado del usuario */
  sideBarClass(u: VpnUser): string {
    return u.status === 'online'  ? 'bg-emerald-500' :
           u.status === 'revoked' ? 'bg-rose-500'    : 'bg-slate-600';
  }

  /** Clase Tailwind para el badge de estado (fondo + texto) */
  statusBadgeClass(u: VpnUser): string {
    return u.status === 'online'  ? 'bg-emerald-500/15 text-emerald-400' :
           u.status === 'revoked' ? 'bg-rose-500/15 text-rose-400'       :
                                    'bg-slate-700/50 text-slate-400';
  }

  /** Etiqueta legible del estado VPN en español */
  statusLabel(u: VpnUser): string {
    return u.status === 'online'  ? 'Conectado'    :
           u.status === 'revoked' ? 'Revocado'     : 'Desconectado';
  }

  /**
   * Color hexadecimal asociado a cada grupo de acceso.
   * @returns Color en formato '#rrggbb'; gris si el grupo no está mapeado
   */
  groupColor(group: VpnGroup): string {
    const map: Record<VpnGroup, string> = {
      admin: '#3b82f6',
      dev:   '#8b5cf6',
      ops:   '#10b981',
      guest: '#f59e0b',
    };
    return map[group] ?? '#64748b';
  }

  //  Privados 

  /** Recalcula los contadores del panel y el valor maxBytes para las barras de progreso */
  private updateStats(): void {
    this.statTotal   = this.allUsers.length;
    this.statOnline  = this.allUsers.filter(u => u.status === 'online').length;
    this.statOffline = this.allUsers.filter(u => u.status === 'offline').length;
    this.statRevoked = this.allUsers.filter(u => u.status === 'revoked').length;

    const totalBytes = this.allUsers.reduce((s, u) => s + u.bytes_rx + u.bytes_tx, 0);
    this.statTraffic = this.formatBytes(totalBytes);

    // maxBytes se usa como techo para normalizar las barras de progreso
    this.maxBytes = Math.max(
      ...this.allUsers.map(u => Math.max(u.bytes_rx, u.bytes_tx)), 1
    );
  }

  /** Actualiza pagedUsers y totalPages según la página y tamaño actuales */
  private paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
    if (this.page >= this.totalPages) this.page = this.totalPages - 1;
    const start = this.page * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }
}