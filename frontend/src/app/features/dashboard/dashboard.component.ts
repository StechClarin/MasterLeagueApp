import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GetDashboardDataGQL } from './graphql/dashboard.generated';
import { StructureStateService } from '@core/services/structure-state.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  ApexTooltip,
  ApexPlotOptions,
  ApexLegend,
  ApexFill,
  ApexResponsive
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  fill: ApexFill;
  responsive: ApexResponsive[];
  colors: string[];
  labels: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardGQL = inject(GetDashboardDataGQL);
  private structureState = inject(StructureStateService);

  dashboardData = signal<any>(null);
  isLoading = signal(true);

  // Chart configs
  public fleetChartOptions!: Partial<ChartOptions>;
  public serviceChartOptions!: Partial<ChartOptions>;
  public revenueChartOptions!: Partial<ChartOptions>;

  constructor() {
    effect(() => {
      const id = this.structureState.currentEstablishmentId();
      if (id) {
        this.fetchData();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
  }

  fetchData() {
    this.isLoading.set(true);
    this.dashboardGQL.fetch({}, { fetchPolicy: 'network-only' })
      .subscribe({
        next: (result) => {
          if (result.data?.dashboardData) {
            this.dashboardData.set(result.data.dashboardData);
            this.initCharts(result.data.dashboardData);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dashboard', err);
          this.isLoading.set(false);
        }
      });
  }

  initCharts(data: any) {
    // 1. Revenue Evolution (Area) - Chiffre d'affaires global
    this.revenueChartOptions = {
      series: [
        {
          name: "Recettes Globales (FCFA)",
          data: data.revenueEvolution.map((p: any) => p.value)
        }
      ],
      chart: {
        height: 320,
        type: "area",
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 }
      },
      colors: ["#10b981"], // emerald-500
      stroke: { curve: "smooth", width: 3 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.revenueEvolution.map((p: any) => p.label),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      tooltip: { theme: 'dark' },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05
        }
      },
      grid: { borderColor: "#f1f5f9" }
    };

    // 2. Fleet Status Distribution (Donut)
    this.fleetChartOptions = {
      series: data.fleetStatusDistribution.map((p: any) => p.count),
      labels: data.fleetStatusDistribution.map((p: any) => p.category),
      chart: {
        type: "donut",
        height: 300
      },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"], // Green, Blue, Amber, Red
      legend: { position: "bottom" },
      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            labels: {
              show: true,
              total: { show: true, label: 'FLOTTE', color: '#64748b' }
            }
          }
        }
      }
    };

    // 3. Service Revenue Distribution (Pie)
    this.serviceChartOptions = {
      series: data.serviceRevenueDistribution.map((p: any) => p.count),
      labels: data.serviceRevenueDistribution.map((p: any) => p.category),
      chart: {
        type: "pie",
        height: 300
      },
      colors: ["#6366f1", "#3b82f6", "#f59e0b"], // Indigo, Blue, Amber
      legend: { position: "bottom" }
    };
  }
}
