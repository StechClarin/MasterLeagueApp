import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface City {
  name: string;
  coords: [number, number];
  country: string;
}

interface Vehicle {
  id: string;
  driverName: string;
  driverAvatar: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: 'stationne' | 'recuperation' | 'en_course' | 'maintenance' | 'assistance' | 'hors_ligne';
  statusLabel: string;
  colorClass: string;
  hexColor: string;
  clientName: string;
  coords: [number, number];
  offset: [number, number];
  marker?: any;
}

@Component({
  selector: 'app-map-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-80px)] flex bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      <!-- Sidebar Control Panel (Google Maps Theme - Light) -->
      <aside class="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-lg">
        
        <!-- Search & Filter Area -->
        <div class="p-6 border-b border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
              </svg>
              Live Tracking
            </h2>
            <button (click)="goBack()" class="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-semibold">
              Retour
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative group">
            <svg class="w-4 h-4 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="filterVehicles()"
              type="text" 
              placeholder="Rechercher chauffeur, plaque..." 
              class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Vehicles List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          <div 
            *ngFor="let vehicle of filteredVehicles"
            (click)="selectVehicle(vehicle)"
            [ngClass]="selectedVehicleId === vehicle.id ? 'border-emerald-500 bg-emerald-50/30' : 'bg-slate-50/50 border-slate-100'"
            class="p-4 border hover:border-slate-300 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all duration-300 flex items-start gap-3 relative group overflow-hidden shadow-sm"
          >
            <!-- Badge Color Indicator -->
            <div class="w-1.5 absolute left-0 top-0 bottom-0" [ngClass]="vehicle.colorClass"></div>
            
            <img [src]="vehicle.driverAvatar" alt="Driver" class="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200" />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-bold text-slate-800 truncate">{{ vehicle.driverName }}</p>
                <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white shadow-sm" [ngClass]="vehicle.colorClass">
                  {{ vehicle.statusLabel }}
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mt-0.5 truncate">{{ vehicle.vehicleModel }} • {{ vehicle.vehiclePlate }}</p>
              <div class="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="truncate">Client: {{ vehicle.clientName }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="filteredVehicles.length === 0" class="text-center py-12">
            <p class="text-slate-400 text-xs italic">Aucun véhicule trouvé</p>
          </div>
        </div>

        <!-- Legend Card -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 space-y-2 text-[10px] text-slate-600">
          <p class="font-bold text-slate-400 uppercase tracking-widest mb-3">Légende Statuts</p>
          <div class="grid grid-cols-2 gap-2 font-semibold">
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Stationné</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-orange-500 rounded-full"></span> Récupération</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> En course</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Maintenance</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Assistance</div>
            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-slate-400 rounded-full"></span> Hors Ligne</div>
          </div>
        </div>

      </aside>

      <!-- Map Container -->
      <div class="flex-1 relative bg-[#e5e9f0]">
        <div id="map-container" class="absolute inset-0 z-0"></div>

        <!-- Floating City Selector Panel -->
        <div class="absolute top-6 left-6 z-10 p-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex items-center gap-4 min-w-[240px] animate-in">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ville Sélectionnée</h4>
            <div class="relative mt-1">
              <select 
                [ngModel]="selectedCity" 
                (ngModelChange)="onCityChange($event)"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option *ngFor="let city of cities" [ngValue]="city">
                  {{ city.name }} ({{ city.country }})
                </option>
              </select>
              <div class="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
      background: #ffffff !important;
      color: #1e293b !important;
      border: 1px solid rgba(226, 232, 240, 0.8) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
    }
    ::ng-deep .leaflet-popup-tip {
      background: #ffffff !important;
      border: 1px solid rgba(226, 232, 240, 0.8) !important;
    }
  `]
})
export class MapTrackingComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  cities: City[] = [
    { name: 'Yaoundé', coords: [3.848, 11.5021], country: 'Cameroun' },
    { name: 'Douala', coords: [4.05, 9.7], country: 'Cameroun' },
    { name: 'Libreville', coords: [0.39, 9.45], country: 'Gabon' },
    { name: 'Paris', coords: [48.8566, 2.3522], country: 'France' }
  ];
  selectedCity: City = this.cities[0];

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
      coords: [0, 0],
      offset: [0.008, 0.0099]
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
      coords: [0, 0],
      offset: [-0.006, -0.0101]
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
      coords: [0, 0],
      offset: [0.014, -0.0011]
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
      coords: [0, 0],
      offset: [-0.017, 0.0179]
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
      coords: [0, 0],
      offset: [0.002, -0.0221]
    },
    {
      id: 'v6',
      driverName: 'Zambo Henri',
      driverAvatar: 'https://ui-avatars.com/api/?name=Zambo+Henri&background=94a3b8&color=fff',
      vehicleModel: 'Toyota Camry',
      vehiclePlate: 'LT-092-FF',
      status: 'hors_ligne',
      statusLabel: 'Hors Ligne',
      colorClass: 'bg-slate-400',
      hexColor: '#94a3b8',
      clientName: 'Aucun',
      coords: [0, 0],
      offset: [0.027, 0.0279]
    }
  ];

  filteredVehicles: Vehicle[] = [];
  searchQuery: string = '';
  selectedVehicleId: string | null = null;

  private map: any;
  private simInterval: any;

  ngOnInit() {
    // Distribute vehicles initially based on the default selected city
    this.updateVehicleCoords();
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

  updateVehicleCoords() {
    this.vehicles.forEach(vehicle => {
      vehicle.coords = [
        this.selectedCity.coords[0] + vehicle.offset[0],
        this.selectedCity.coords[1] + vehicle.offset[1]
      ];
    });
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

    this.map = L.map('map-container', {
      zoomControl: false
    }).setView(this.selectedCity.coords, 13.5);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Google Maps white-gray style (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, CartoDB'
    }).addTo(this.map);

    // Add vehicles to map
    this.vehicles.forEach(vehicle => {
      const customMarkup = `
        <div class="relative flex items-center justify-center p-1.5 rounded-full border-2 border-white shadow-md text-white transition-transform hover:scale-110" style="background-color: ${vehicle.hexColor}; width: 34px; height: 34px;">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          ${['recuperation', 'en_course'].includes(vehicle.status) ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping" style="background-color: ${vehicle.hexColor}"></span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customMarkup,
        className: 'custom-taxi-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const popupContent = `
        <div class="p-1 min-w-[200px]">
          <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Fiche Course</h4>
          <div class="space-y-1 text-[10px] text-slate-600">
            <p><strong>Chauffeur:</strong> ${vehicle.driverName}</p>
            <p><strong>Véhicule:</strong> ${vehicle.vehicleModel} (${vehicle.vehiclePlate})</p>
            <p><strong>Statut:</strong> <span class="font-bold" style="color: ${vehicle.hexColor}">${vehicle.statusLabel}</span></p>
            <p class="border-t border-slate-100 pt-1 mt-1 text-emerald-600"><strong>Client:</strong> ${vehicle.clientName}</p>
          </div>
        </div>
      `;

      const marker = L.marker(vehicle.coords, { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent, { closeButton: false });

      // Hover triggers (mouseover & mouseout)
      marker.on('mouseover', () => {
        marker.openPopup();
      });
      marker.on('mouseout', () => {
        marker.closePopup();
      });

      vehicle.marker = marker;
    });

    this.startSimulation();
  }

  startSimulation() {
    this.simInterval = setInterval(() => {
      this.vehicles.forEach(vehicle => {
        if (['recuperation', 'en_course', 'maintenance'].includes(vehicle.status)) {
          const latOffset = (Math.random() - 0.5) * 0.0012;
          const lngOffset = (Math.random() - 0.5) * 0.0012;
          vehicle.coords = [vehicle.coords[0] + latOffset, vehicle.coords[1] + lngOffset];

          if (vehicle.marker) {
            vehicle.marker.setLatLng(vehicle.coords);
          }
        }
      });
    }, 4000);
  }

  onCityChange(city: City) {
    this.selectedCity = city;
    this.updateVehicleCoords();
    
    // Move marker positions instantly on the map
    this.vehicles.forEach(vehicle => {
      if (vehicle.marker) {
        vehicle.marker.setLatLng(vehicle.coords);
      }
    });

    // Animate map view change to the new city center
    if (this.map) {
      this.map.setView(city.coords, 13.5, { animate: true, duration: 1.5 });
    }
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
