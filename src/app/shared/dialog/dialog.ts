import { Component, EventEmitter, Input, Output, } from '@angular/core';

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

  open(): void {
    this.isClosing = false;
    this.isOpen = true;
  }

  close(): void {
    if (this.isClosing) return;

    this.isClosing = true;    

    setTimeout(() => {  
      this.isClosing = false;
      this.isOpen = false;
      this.closed.emit();
    }, 240);
  }
}

