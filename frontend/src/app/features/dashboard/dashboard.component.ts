import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GetDashboardDataGQL } from './graphql/dashboard.generated';
import { StructureStateService } from '@core/services/structure-state.service';
import { map } from 'rxjs/operators';
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
  private router = inject(Router);

  dashboardData = signal<any>(null);
  isLoading = signal(true);

  // Chart configs
  public evolutionChartOptions!: Partial<ChartOptions>;
  public distributionChartOptions!: Partial<ChartOptions>;
  public revenueChartOptions!: Partial<ChartOptions>;
  public paymentMethodsChartOptions!: Partial<ChartOptions>;
  public genderChartOptions!: Partial<ChartOptions>;
  public subjectGradesChartOptions!: Partial<ChartOptions>;
  public invoiceStatusChartOptions!: Partial<ChartOptions>;
  public staffContractChartOptions!: Partial<ChartOptions>;
  public enrollmentEvolutionChartOptions!: Partial<ChartOptions>;

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
    if (!this.dashboardData() && this.structureState.currentEstablishmentId()) {
      this.fetchData();
    }
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

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  printDashboardReport() {
    window.print();
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'CASH': 'Espèces',
      'MOBILE_MONEY': 'Mobile Money',
      'BANK_TRANSFER': 'Virement',
      'CHECK': 'Chèque'
    };
    return labels[method] || method;
  }

  getEnrollmentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'REGISTERED': 'Inscrit',
      'LEFT': 'Parti',
      'EXPELLED': 'Renvoyé'
    };
    return labels[status] || status;
  }

  initCharts(data: any) {
    // 1. Evolution Chart (Area/Line) - Grades
    this.evolutionChartOptions = {
      series: [
        {
          name: "Moyenne Générale",
          data: data.gradeEvolution.map((p: any) => p.value)
        }
      ],
      chart: {
        height: 280,
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
      tooltip: { theme: 'dark' },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        }
      },
      grid: { borderColor: "#f1f5f9" }
    };

    // 2. Revenue Evolution (Area)
    this.revenueChartOptions = {
      series: [
        {
          name: "Recettes",
          data: data.revenueEvolution.map((p: any) => p.value)
        }
      ],
      chart: {
        height: 280,
        type: "area",
        toolbar: { show: false }
      },
      colors: ["#10b981"], // emerald-500
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: data.revenueEvolution.map((p: any) => p.label)
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05
        }
      }
    };

    // 3. Distribution Chart (Donut) - Students
    this.distributionChartOptions = {
      series: data.studentDistribution.map((p: any) => p.count),
      labels: data.studentDistribution.map((p: any) => p.category),
      chart: {
        type: "donut",
        height: 280
      },
      colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
      legend: { position: "bottom" },
      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            labels: {
              show: true,
              total: { show: true, label: 'TOTAL', color: '#64748b' }
            }
          }
        }
      }
    };

    // 4. Payment Methods Distribution (Pie/Donut)
    this.paymentMethodsChartOptions = {
      series: data.paymentMethodsDistribution.map((p: any) => p.count),
      labels: data.paymentMethodsDistribution.map((p: any) => this.getPaymentMethodLabel(p.category)),
      chart: {
        type: "pie",
        height: 280
      },
      colors: ["#8b5cf6", "#ec4899", "#f43f5e", "#fb923c"],
      legend: { position: "bottom" }
    };

    // 5. Gender Demographics Chart (Donut)
    const maleCount = data.studentGenderDistribution?.find((p: any) => p.category === 'Masculin')?.count || 0;
    const femaleCount = data.studentGenderDistribution?.find((p: any) => p.category === 'Féminin')?.count || 0;
    
    this.genderChartOptions = {
      series: [maleCount, femaleCount],
      labels: ["Garçons", "Filles"],
      chart: {
        type: "donut",
        height: 280
      },
      colors: ["#3b82f6", "#ec4899"],
      legend: { position: "bottom" },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Filles',
                color: '#64748b',
                formatter: () => {
                  const total = maleCount + femaleCount;
                  if (total === 0) return '0%';
                  return `${Math.round((femaleCount / total) * 100)}%`;
                }
              }
            }
          }
        }
      }
    };

    // 6. Subject Grades (Bar Chart)
    this.subjectGradesChartOptions = {
      series: [
        {
          name: "Moyenne",
          data: data.subjectGradesDistribution?.map((p: any) => p.count) || []
        }
      ],
      chart: {
        type: "bar",
        height: 280,
        toolbar: { show: false }
      },
      colors: ["#3b82f6"],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "55%",
          borderRadius: 4
        }
      },
      dataLabels: { enabled: true },
      xaxis: {
        categories: data.subjectGradesDistribution?.map((p: any) => p.category) || []
      }
    };

    // 7. Invoice Status (Pie Chart)
    this.invoiceStatusChartOptions = {
      series: data.invoiceStatusDistribution?.map((p: any) => p.count) || [],
      labels: data.invoiceStatusDistribution?.map((p: any) => p.category) || [],
      chart: {
        type: "pie",
        height: 280
      },
      colors: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
      legend: { position: "bottom" }
    };

    // 8. Staff Contract Distribution (Donut Chart)
    this.staffContractChartOptions = {
      series: data.staffContractDistribution?.map((p: any) => p.count) || [],
      labels: data.staffContractDistribution?.map((p: any) => p.category) || [],
      chart: {
        type: "donut",
        height: 280
      },
      colors: ["#6366f1", "#10b981", "#fb7185", "#f59e0b"],
      legend: { position: "bottom" }
    };

    // 9. Enrollment Evolution (Line / Area Chart)
    this.enrollmentEvolutionChartOptions = {
      series: [
        {
          name: "Inscriptions",
          data: data.enrollmentEvolution?.map((p: any) => p.value) || []
        }
      ],
      chart: {
        type: "area",
        height: 280,
        toolbar: { show: false }
      },
      colors: ["#ec4899"],
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: data.enrollmentEvolution?.map((p: any) => p.label) || []
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05
        }
      }
    };
  }
}
