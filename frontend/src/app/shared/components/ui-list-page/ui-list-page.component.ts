import { Component, Input } from '@angular/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-ui-list-page',
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
  template: `
    <div class="p-6 w-full max-w-[90%] mx-auto min-h-screen bg-gray-50/50 space-y-8">
    
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">{{ title }}</h2>
          @if (description) {
            <p class="text-sm text-gray-500 mt-1 font-medium">{{ description }}</p>
          }
        </div>
    
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    
      <!-- Filters & Toolbar Section -->
      <div class="space-y-6">
        <ng-content select="[filters]"></ng-content>
      </div>
    
      <!-- Main Content (Table) -->
      @if (!isLoading) {
        @if (!isEmpty) {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md mb-6">
            <ng-content select="[table]"></ng-content>
          </div>
        } @else {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center py-20">
            <div class="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                </path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Aucune donnée</h3>
            <p class="text-gray-500 mt-2 max-w-sm mx-auto">Il n'y a rien à afficher pour le moment.</p>
            <div class="mt-6">
              <ng-content select="[empty-actions]"></ng-content>
            </div>
          </div>
        }
      }
    
      <!-- Loading State (Skeleton) -->
      @if (isLoading) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <!-- Header Skeleton -->
          <div class="flex justify-between mb-6">
            <ngx-skeleton-loader
              count="1"
              appearance="line"
              [theme]="{ height: '30px', width: '250px', 'background-color': '#f3f4f6' }"
            ></ngx-skeleton-loader>
            <ngx-skeleton-loader
              count="1"
              appearance="line"
              [theme]="{ height: '35px', width: '150px', 'border-radius': '8px', 'background-color': '#f3f4f6' }"
            ></ngx-skeleton-loader>
          </div>
          <!-- Rows Skeleton -->
          <div class="space-y-4">
            <ngx-skeleton-loader
              count="6"
              appearance="line"
              [theme]="{ height: '50px', 'margin-bottom': '10px', 'border-radius': '8px', 'background-color': '#f9fafb' }"
            ></ngx-skeleton-loader>
          </div>
        </div>
      }
    
      <!-- Empty State Template -->
    
      <!-- Pagination -->
      @if (!isLoading && !isEmpty) {
        <div class="pt-6">
          <ng-content select="[pagination]"></ng-content>
        </div>
      }
    
      <!-- Modals -->
      <ng-content select="[modals]"></ng-content>
    
    </div>
    `
})
export class UiListPageComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() isLoading: boolean = false;
  @Input() isEmpty: boolean = false;
}
