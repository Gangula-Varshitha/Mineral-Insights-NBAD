import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  countries: any[] = []; // List of countries for the select option
  selectedCountry: string = ''; // Selected country
  selectedCountryDetails: any = null; // Details of the selected country

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    Chart.register(...registerables);

    this.loadPieChart();
    this.loadStackedBarChart();
  }

  loadPieChart(): void {
      this.authService.getData('/chart/bauxite-reserves').subscribe((response: any) => {
        if (response.success) {
          const chartData = response.data;

          // Calculate the total sum of all percentages
          const totalPercentage = chartData.reduce((sum: number, item: any) => sum + item.reservesPercentage, 0);

          // Normalize percentages to ensure they sum to 100%
          const normalizedData = chartData.map((item: any) => ({
            name: item.name,
            normalizedPercentage: (item.reservesPercentage / totalPercentage) * 100,
          }));

          // Save countries for select option
          this.countries = normalizedData.map((item: any) => ({
            name: item.name,
            value: item.normalizedPercentage.toFixed(2), // Format to 2 decimal places
          }));

          // Initialize selected country
          if (this.countries.length > 0) {
            this.selectedCountry = this.countries[0].name;
            this.updateSelectedCountryDetails();
          }

          // Create the pie chart
          const ctx = document.getElementById('bauxitePieChart') as HTMLCanvasElement;
          new Chart(ctx, {
            type: 'pie',
            data: {
              labels: normalizedData.map((item: any) => item.name), // Country names
              datasets: [
                {
                  data: normalizedData.map((item: any) => item.normalizedPercentage), // Normalized Percentages
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(100, 200, 75, 0.6)',
                    'rgba(200, 100, 150, 0.6)',
                    'rgba(50, 150, 200, 0.6)',
                    'rgba(80, 80, 80, 0.6)',
                  ],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const value = context.raw;
                      const label = context.label;
                      return `${label}: ${value.toFixed(2)}%`;
                    },
                  },
                },
              },
            },
          });
        }
      });
  }


  loadStackedBarChart(): void {
    this.authService.getData('/chart/bauxite-trends-new').subscribe((response: any) => {
      if (response.success) {
        const chartData = response.data;

        console.log( chartData );

        const ctx = document.getElementById('bauxiteStackedBarChart') as HTMLCanvasElement;

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.years, // Years on the x-axis
            datasets: chartData.countries.map((country: any) => ({
              label: country.name,
              data: country.values, // Data for each year
              backgroundColor: this.getRandomColor(), // Assign random colors for each country
            })),
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Year',
                },
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Percentage (%)',
                },
                beginAtZero: true,
              },
            },
          },
        });
      }
    }, (error: any) => {
      alert("You have been logged out");
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }

  // Update selected country details
  updateSelectedCountryDetails(): void {
    this.selectedCountryDetails = this.countries.find(
      (country) => country.name === this.selectedCountry
    );
  }

  // Generate random color
  private getRandomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }
}
