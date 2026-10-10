import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiButtonComponent } from '@shared/components/ui-button/ui-button.component';

interface Vehicle {
  id: string;
  driverName: string;
  driverAvatar: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: 'stationne' | 'recuperation' | 'en_course' | 'maintenance' | 'assistance' | 'hors_ligne';
  statusLabel: string;
  colorClass: string; // Tailwind bg color
  hexColor: string; // Marker ring color
  clientName: string;
  coords: [number, number];
  marker?: any;
}

@Component({
  selector: 'app-map-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButtonComponent],
  template: `
    <div class="h-[calc(100vh-80px)] flex bg-[#0a0f1d] text-slate-100 font-sans overflow-hidden">
    
      <!-- Sidebar Control Panel -->
      <aside class="w-80 bg-[#070b19] border-r border-slate-800/60 flex flex-col z-10 shrink-0">
    
        <!-- Search & Filter Area -->
        <div class="p-6 border-b border-slate-800/60 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
              </svg>
              Live Tracking
            </h2>
            <app-ui-button
              label="Retour"
              variant="ghost"
              size="sm"
              icon="back"
              customClass="!text-slate-400 hover:!text-white hover:!bg-slate-800 !py-1 !px-2"
              (btnClick)="goBack()">
            </app-ui-button>
          </div>
    
          <!-- Search Input -->
          <div class="relative group">
            <svg class="w-4 h-4 absolute left-3 top-3 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterVehicles()"
              type="text"
              placeholder="Chauffeur, immatriculation..."
              class="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
          </div>
        </div>
    
        <!-- Vehicles List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          @for (vehicle of filteredVehicles; track vehicle) {
            <div
              (click)="selectVehicle(vehicle)"
              [ngClass]="selectedVehicleId === vehicle.id ? 'border-emerald-500 bg-slate-800/40' : ''"
              class="p-4 bg-slate-800/20 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/20 rounded-2xl cursor-pointer transition-all duration-300 flex items-start gap-3 relative group overflow-hidden"
              >
              <!-- Badge Color Indicator -->
              <div class="w-1.5 absolute left-0 top-0 bottom-0" [ngClass]="vehicle.colorClass"></div>
              <img [src]="vehicle.driverAvatar" alt="Driver" class="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-700" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-xs font-bold text-white truncate">{{ vehicle.driverName }}</p>
                  <span class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-white shadow-sm" [ngClass]="vehicle.colorClass">
                    {{ vehicle.statusLabel }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5 truncate">{{ vehicle.vehicleModel }} • {{ vehicle.vehiclePlate }}</p>
                <div class="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="truncate">Client: {{ vehicle.clientName }}</span>
                </div>
              </div>
            </div>
          }
    
          @if (filteredVehicles.length === 0) {
            <div class="text-center py-12">
              <p class="text-slate-500 text-xs italic">Aucun véhicule trouvé</p>
            </div>
          }
        </div>
    
        <!-- Quick Status Map Legend -->
        <div class="p-6 bg-[#04060c] border-t border-slate-800/60 space-y-2 text-[10px]">
          <p class="font-bold text-slate-400 uppercase tracking-widest mb-3">Légende Statuts</p>
          <div class="grid grid-cols-2 gap-2 font-medium">
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Stationné</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></span> Récupération</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> En course</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Maintenance</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Assistance</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-slate-500 rounded-full"></span> Hors Ligne</div>
          </div>
        </div>
    
      </aside>
    
      <!-- Map Container -->
      <div class="flex-1 relative bg-[#070b19]">
        <div id="map-container" class="absolute inset-0 z-0"></div>
    
        <!-- Glassmorphic Map Control Overlay (Floating Indicator) -->
        <div class="absolute top-6 left-6 z-10 p-4 bg-[#070b19]/80 backdrop-blur-md border border-slate-700/40 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs animate-in">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center animate-pulse">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-black text-white uppercase tracking-wider">Trafic Yaoundé</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Simulation de géolocalisation live par GPS active.</p>
          </div>
        </div>
      </div>
    
    </div>
    `,
  styles: [`
    #map-container {
      width: 100%;
      height: 100%;
    }
    ::ng-deep .leaflet-popup-content-wrapper {
      background: #070b19 !important;
      color: #cbd5e1 !important;
      border: 1px solid rgba(51, 65, 85, 0.5) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
    }
    ::ng-deep .leaflet-popup-tip {
      background: #070b19 !important;
      border: 1px solid rgba(51, 65, 85, 0.5) !important;
    }
  `]
})
export class MapTrackingComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  // Live vehicles list
  vehicles: Vehicle[] = [
    {
      id: 'v1',
      driverName: 'Abessolo Jean-Pierre',
      driverAvatar: 'https://ui-avatars.com/api/?name=Abessolo+Jean+Pierre&background=ef4444&color=fff',
      vehicleModel: 'Toyota Corolla',
      vehiclePlate: 'LT-982-AA',
      status: 'stationne',
      statusLabel: 'Stationné',
      colorClass: 'bg-red-500',
      hexColor: '#ef4444',
      clientName: 'Aucun',
      coords: [3.856, 11.512]
    },
    {
      id: 'v2',
      driverName: 'Fouda Marie-Thérèse',
      driverAvatar: 'https://ui-avatars.com/api/?name=Fouda+Marie+Therese&background=f97316&color=fff',
      vehicleModel: 'Hyundai Elantra',
      vehiclePlate: 'CE-443-BB',
      status: 'recuperation',
      statusLabel: 'Récupération',
      colorClass: 'bg-orange-500',
      hexColor: '#f97316',
      clientName: 'M. Ngoa Jean',
      coords: [3.842, 11.492]
    },
    {
      id: 'v3',
      driverName: 'Kamga Simplice',
      driverAvatar: 'https://ui-avatars.com/api/?name=Kamga+Simplice&background=10b981&color=fff',
      vehicleModel: 'Toyota Yaris',
      vehiclePlate: 'LT-102-CC',
      status: 'en_course',
      statusLabel: 'En Course',
      colorClass: 'bg-emerald-500',
      hexColor: '#10b981',
      clientName: 'Mme Eboa Suzanne',
      coords: [3.862, 11.501]
    },
    {
      id: 'v4',
      driverName: 'Nguema Paul',
      driverAvatar: 'https://ui-avatars.com/api/?name=Nguema+Paul&background=3b82f6&color=fff',
      vehicleModel: 'Suzuki Swift',
      vehiclePlate: 'CE-765-DD',
      status: 'maintenance',
      statusLabel: 'Maintenance',
      colorClass: 'bg-blue-500',
      hexColor: '#3b82f6',
      clientName: 'Technicien Ndong',
      coords: [3.831, 11.520]
    },
    {
      id: 'v5',
      driverName: 'Biyogo Marc',
      driverAvatar: 'https://ui-avatars.com/api/?name=Biyogo+Marc&background=a855f7&color=fff',
      vehicleModel: 'Peugeot 301',
      vehiclePlate: 'CE-882-EE',
      status: 'assistance',
      statusLabel: 'Assistance',
      colorClass: 'bg-purple-500',
      hexColor: '#a855f7',
      clientName: 'Chauffeur Biyogo (Crevaison)',
      coords: [3.850, 11.480]
    },
    {
      id: 'v6',
      driverName: 'Zambo Henri',
      driverAvatar: 'https://ui-avatars.com/api/?name=Zambo+Henri&background=6b7280&color=fff',
      vehicleModel: 'Toyota Camry',
      vehiclePlate: 'LT-092-FF',
      status: 'hors_ligne',
      statusLabel: 'Hors Ligne',
      colorClass: 'bg-slate-500',
      hexColor: '#6b7280',
      clientName: 'Aucun',
      coords: [3.875, 11.530]
    }
  ];

  filteredVehicles: Vehicle[] = [];
  searchQuery: string = '';
  selectedVehicleId: string | null = null;

  // Leaflet map instance
  private map: any;
  private simInterval: any;

  ngOnInit() {
    this.filteredVehicles = [...this.vehicles];
    this.loadLeaflet().then(() => {
      this.initMap();
    });
  }

  ngOnDestroy() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
    }
  }

  async loadLeaflet(): Promise<void> {
    if ((window as any).L) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  initMap() {
    const L = (window as any).L;
    if (!L) return;

    // Center map around Yaoundé Cameroon
    this.map = L.map('map-container', {
      zoomControl: false
    }).setView([3.848, 11.5021], 13.5);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Dark tiles representation of OSM
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, CartoDB'
    }).addTo(this.map);

    // Add vehicles to map
    this.vehicles.forEach(vehicle => {
      const customMarkup = `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-6 w-6 rounded-full opacity-45 animate-ping" style="background-color: ${vehicle.hexColor}"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-lg shrink-0" style="background-color: ${vehicle.hexColor}"></span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customMarkup,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h4 class="text-xs font-black text-white uppercase tracking-wider mb-2 border-b border-slate-700/50 pb-1">Fiche Course</h4>
          <div class="space-y-1 text-[10px] text-slate-300">
            <p><strong>Chauffeur:</strong> ${vehicle.driverName}</p>
            <p><strong>Véhicule:</strong> ${vehicle.vehicleModel} (${vehicle.vehiclePlate})</p>
            <p><strong>Statut:</strong> <span class="font-bold" style="color: ${vehicle.hexColor}">${vehicle.statusLabel}</span></p>
            <p class="border-t border-slate-800 pt-1 mt-1 text-emerald-400"><strong>Client:</strong> ${vehicle.clientName}</p>
          </div>
        </div>
      `;

      const marker = L.marker(vehicle.coords, { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      vehicle.marker = marker;
    });

    this.startSimulation();
  }

  // Simulation: Move active cars slightly
  startSimulation() {
    this.simInterval = setInterval(() => {
      this.vehicles.forEach(vehicle => {
        if (['recuperation', 'en_course', 'maintenance'].includes(vehicle.status)) {
          // Slight coords change (traffic simulation)
          const latOffset = (Math.random() - 0.5) * 0.0012;
          const lngOffset = (Math.random() - 0.5) * 0.0012;
          vehicle.coords = [vehicle.coords[0] + latOffset, vehicle.coords[1] + lngOffset];

          // Update marker position
          if (vehicle.marker) {
            vehicle.marker.setLatLng(vehicle.coords);
          }
        }
      });
    }, 4000);
  }

  filterVehicles() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredVehicles = [...this.vehicles];
    } else {
      this.filteredVehicles = this.vehicles.filter(v => 
        v.driverName.toLowerCase().includes(query) || 
        v.vehiclePlate.toLowerCase().includes(query) ||
        v.vehicleModel.toLowerCase().includes(query)
      );
    }
  }

  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicleId = vehicle.id;
    if (this.map && vehicle.coords) {
      this.map.flyTo(vehicle.coords, 16, { animate: true, duration: 1.5 });
      if (vehicle.marker) {
        vehicle.marker.openPopup();
      }
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
