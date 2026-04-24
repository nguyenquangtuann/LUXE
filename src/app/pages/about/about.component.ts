import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('storySection') storySection!: QueryList<ElementRef>;
  @ViewChildren('valuesSection') valuesSection!: QueryList<ElementRef>;
  @ViewChildren('statsSection') statsSection!: QueryList<ElementRef>;
  @ViewChildren('craftSection') craftSection!: QueryList<ElementRef>;
  @ViewChildren('teamSection') teamSection!: QueryList<ElementRef>;

  heroVisible = signal(false);
  storyVisible = signal(false);
  valuesVisible = signal(false);
  statsVisible = signal(false);
  craftVisible = signal(false);
  teamVisible = signal(false);

  private observer: IntersectionObserver | null = null;

  values = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      title: 'Exceptional Quality',
      description: 'We source only the finest materials from trusted suppliers worldwide, ensuring every piece meets our exacting standards.'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>`,
      title: 'Timeless Design',
      description: 'Our designs transcend trends, creating pieces that remain elegant and relevant season after season.'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
      title: 'Sustainable Luxury',
      description: 'We are committed to ethical practices and sustainable sourcing, ensuring our luxury leaves a positive footprint.'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
      title: 'Personal Service',
      description: 'Our dedicated team provides personalized attention, ensuring every client receives an exceptional experience.'
    }
  ];

  stats = [
    { value: '150', suffix: '+', label: 'Master Artisans' },
    { value: '40', suffix: '', label: 'Years of Excellence' },
    { value: '12', suffix: '', label: 'Global Ateliers' },
    { value: '50K', suffix: '+', label: 'Happy Clients' }
  ];

  craftFeatures = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      title: 'Premium Materials',
      description: 'Sourced from the finest suppliers worldwide'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
      title: 'Handcrafted Details',
      description: 'Every stitch placed with precision and care'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      title: 'Quality Assured',
      description: 'Rigorous testing at every production stage'
    }
  ];

  team = [
    {
      name: 'Sophie Laurent',
      role: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=700&fit=crop'
    },
    {
      name: 'Marcus Chen',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop'
    },
    {
      name: 'Elena Rossi',
      role: 'Master Artisan',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=700&fit=crop'
    },
    {
      name: 'James Mitchell',
      role: 'Global Operations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop'
    }
  ];

  ngOnInit() {
    setTimeout(() => this.heroVisible.set(true), 300);

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('data-section');
              switch (id) {
                case 'story': this.storyVisible.set(true); break;
                case 'values': this.valuesVisible.set(true); break;
                case 'stats': this.statsVisible.set(true); break;
                case 'craft': this.craftVisible.set(true); break;
                case 'team': this.teamVisible.set(true); break;
              }
            }
          });
        },
        { threshold: 0.2 }
      );
    }
  }

  ngAfterViewInit() {
    this.observeSection(this.storySection, 'story');
    this.observeSection(this.valuesSection, 'values');
    this.observeSection(this.statsSection, 'stats');
    this.observeSection(this.craftSection, 'craft');
    this.observeSection(this.teamSection, 'team');
  }

  private observeSection(section: QueryList<ElementRef>, id: string) {
    if (this.observer && section.first) {
      section.first.nativeElement.setAttribute('data-section', id);
      this.observer.observe(section.first.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
