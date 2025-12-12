import { ChangeDetectorRef, Component, EventEmitter, Input, Output, } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  @Input() width = '480px';
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  isClosing = false;

  // open(): void {
  //   this.isClosing = false;
  //   this.isOpen = true;
  // }

  // close(): void {
  //   if (this.isClosing) return;

  //   this.isClosing = true;    

  //   setTimeout(() => {  
  //     this.isClosing = false;
  //     this.isOpen = false;
  //     this.closed.emit();
  //   }, 240);
  // }


  /* ---------------------------- Fix Versuch Emil ---------------------------- */
  constructor(private cdr: ChangeDetectorRef) {}
  

    close(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.closed.emit();
      this.cdr.markForCheck(); // CDR kommt von anular
    }, 200); // zeit passt nicht ganz, der übergng zu background sieht komisch aus
  }

  open(): void {
    this.isClosing = false;
    this.isOpen = true;
    this.cdr.markForCheck();
  }
}

