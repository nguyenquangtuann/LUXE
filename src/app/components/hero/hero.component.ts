import { Component, signal, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements AfterViewInit {
  scrollY = signal(0);
  
  ngAfterViewInit() {
    this.scrollY.set(window.scrollY);
  }
  
  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }
}
