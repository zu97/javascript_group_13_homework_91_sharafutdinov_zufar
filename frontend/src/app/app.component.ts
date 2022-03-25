import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

interface wsDrawData {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface wsMessage {
  type: string;
  data: wsDrawData[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas') canvasElement!: ElementRef;

  private ws!: WebSocket;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private isMouseDown = false;

  size = 1;
  color = '#000';

  ngAfterViewInit(): void {
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ws = new WebSocket('ws://localhost:8000');
    this.ws.onmessage = event => {
      const message = <wsMessage>JSON.parse(event.data);
      if (message.type !== 'NEW_DRAW') {
        return;
      }

      message.data.forEach((draw) => this.drawCircle(draw.x, draw.y, draw.size, draw.color));
    };
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }

    const x = event.offsetX;
    const y = event.offsetY;

    this.sendDrawMessage(x, y);
  }

  mouseDown(event: MouseEvent): void {
    this.isMouseDown = true;

    const x = event.offsetX;
    const y = event.offsetY;

    this.sendDrawMessage(x, y);
  }

  mouseUp(): void {
    this.isMouseDown = false;
  }

  drawCircle(x: number, y: number, size: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);

    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  sendDrawMessage(x: number, y: number): void {
    const message = {
      type: 'SEND_DRAW',
      data: { x, y, size: this.size, color: this.color }
    };

    this.ws.send(JSON.stringify(message));
  }

}
