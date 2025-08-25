import { createCanvas } from 'canvas';

export class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    return {
      canvas,
      context,
    };
  }

  reset(canvas: any, context: any) {
    // Optional cleanup if needed
  }
}
