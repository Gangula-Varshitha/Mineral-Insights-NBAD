import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    // this.loadMineralSummaryChart();
    this.loadBauxiteProductionChart();
    this.loadLineChart();
  }

  loadBauxiteProductionChart(): void {
    this.authService.getData('/chart/bauxite-production').subscribe(
      (data: any) => {
        const ctx = (document.getElementById('bauxiteProductionChart') as HTMLCanvasElement).getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: data.labels, // Country names
              datasets: [
                {
                  label: 'Share of Global Production (%)',
                  data: data.shares,
                  backgroundColor: 'rgba(54, 162, 235, 0.8)'
                }
              ]
            },
            options: {
              responsive: true,
              indexAxis: 'y', // Horizontal bar chart
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                x: {
                  title: { display: true, text: 'Share of Global Production (%)' },
                  ticks: { precision: 0 }
                },
                y: {
                  title: { display: true, text: 'Countries' }
                }
              }
            }
          });
        }
      },
      (error: any) => {
        alert("You have been logged out");
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    );
  }

  loadLineChart(): void {
    this.authService.getData('/chart/bauxite-trends').subscribe(
      (data: any) => {
        const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.years, // x-axis: Years
              datasets: data.countries.map((country: any) => ({
                label: country.name,
                data: country.production,
                borderColor: country.color,
                fill: false,
                tension: 0.1 // Smooth lines
              }))
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    // Customize the tooltip title to display the year
                    title: (tooltipItems) => {
                      return `Year: ${tooltipItems[0].label}`;
                    },
                    // Customize the tooltip content to show country and percentage
                    label: (tooltipItem) => {
                      const dataset = tooltipItem.dataset;
                      const country = dataset.label;
                      const value = dataset.data[tooltipItem.dataIndex] as number;
                      return `${country}: ${value.toFixed(2)}%`; // Display with 2 decimal places
                    }
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: 'Years' } },
                y: {
                  title: {
                    display: true,
                    text: 'Production Share (%)'
                  },
                  beginAtZero: true
                }
              }
            }
          });
        }
      },
      (error) => console.error('Failed to load line chart data:', error)
    );
  }

}
