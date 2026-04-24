import { Component, signal, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('cardsSection') cardsSection!: QueryList<ElementRef>;
  @ViewChildren('formSection') formSection!: QueryList<ElementRef>;
  @ViewChildren('locationsSection') locationsSection!: QueryList<ElementRef>;

  heroVisible = signal(false);
  cardsVisible = signal(false);
  formVisible = signal(false);
  locationsVisible = signal(false);
  
  focusedField = signal<string | null>(null);
  isSubmitting = signal(false);
  isSubmitted = signal(false);

  private observer: IntersectionObserver | null = null;

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false
  };

  contactCards = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      title: 'Visit Us',
      lines: ['88 Avenue des Champs-Elysees', '75008 Paris, France'],
      action: 'Get Directions',
      actionLink: '#'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
      title: 'Call Us',
      lines: ['+33 1 42 86 82 00', 'Mon - Sat: 10:00 - 19:00'],
      action: 'Call Now',
      actionLink: 'tel:+33142868200'
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      title: 'Email Us',
      lines: ['concierge@luxe.com', 'support@luxe.com'],
      action: 'Send Email',
      actionLink: 'mailto:concierge@luxe.com'
    }
  ];

  socials = [
    {
      name: 'Instagram',
      handle: '@luxe_official',
      link: '#',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="1.5"/></svg>`
    },
    {
      name: 'Facebook',
      handle: '/LUXEofficial',
      link: '#',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`
    },
    {
      name: 'Twitter',
      handle: '@luxe',
      link: '#',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>`
    },
    {
      name: 'Pinterest',
      handle: '/luxe',
      link: '#',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8.5 13.5c-.5-2 .5-4 2.5-5s4.5 0 5.5 2c1 2 0 5-2 6.5-1 .8-2 .5-2 0v-2"/><path d="M12 17l-1 4"/></svg>`
    }
  ];

  locations = [
    {
      city: 'Paris',
      address: '88 Avenue des Champs-Elysees',
      hours: 'Mon - Sat: 10:00 - 19:00',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
      flag: '🇫🇷'
    },
    {
      city: 'New York',
      address: '680 Fifth Avenue',
      hours: 'Mon - Sat: 10:00 - 20:00',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop',
      flag: '🇺🇸'
    },
    {
      city: 'Tokyo',
      address: '4-12-10 Ginza, Chuo',
      hours: 'Mon - Sun: 11:00 - 20:00',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
      flag: '🇯🇵'
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
                case 'cards': this.cardsVisible.set(true); break;
                case 'form': this.formVisible.set(true); break;
                case 'locations': this.locationsVisible.set(true); break;
              }
            }
          });
        },
        { threshold: 0.1 }
      );
    }
  }

  ngAfterViewInit() {
    this.observeSection(this.cardsSection, 'cards');
    this.observeSection(this.formSection, 'form');
    this.observeSection(this.locationsSection, 'locations');
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

  submitForm() {
    this.isSubmitting.set(true);
    
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
    }, 2000);
  }

  resetForm() {
    this.isSubmitted.set(false);
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      newsletter: false
    };
  }
}
