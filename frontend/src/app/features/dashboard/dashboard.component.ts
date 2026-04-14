import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GetDashboardDataGQL } from './graphql/dashboard.generated';
import { StructureStateService } from '@core/services/structure-state.service';
import { map } from 'rxjs/operators';
// ... (imports remain the same)
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
  public evolutionChartOptions!: Partial<ChartOptions>;
  public distributionChartOptions!: Partial<ChartOptions>;

  constructor() {
    // Re-fetch data whenever the establishment changes
    effect(() => {
      const id = this.structureState.currentEstablishmentId();
      if (id) {
        console.log('[Dashboard] Etablissement détecté, chargement des données:', id);
        this.fetchData();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Data is handled by the effect on initialization
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
    // 1. Evolution Chart (Area/Line)
    this.evolutionChartOptions = {
      series: [
        {
          name: "Moyenne Générale",
          data: data.gradeEvolution.map((p: any) => p.value)
        }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 }
      },
      colors: ["#6366f1"], // indigo-500
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: data.gradeEvolution.map((p: any) => p.label),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      tooltip: {
        theme: 'dark',
        x: { show: true }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        }
      },
      grid: {
        borderColor: "#f1f5f9",
        row: { colors: ["transparent", "transparent"], opacity: 0.5 }
      }
    };

    // 2. Distribution Chart (Donut)
    this.distributionChartOptions = {
      series: data.studentDistribution.map((p: any) => p.count),
      labels: data.studentDistribution.map((p: any) => p.category),
      chart: {
        type: "donut",
        height: 350,
        animations: { enabled: true }
      },
      colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif"
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: 'TOTAL',
                color: '#64748b'
              }
            }
          }
        }
      }
    };
  }
}
