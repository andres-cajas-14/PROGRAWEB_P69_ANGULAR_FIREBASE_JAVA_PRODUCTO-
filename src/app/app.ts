import { Component } from '@angular/core';
import { Productos } from './components/productos/productos';

@Component({
  selector: 'app-root',
  imports: [Productos],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}