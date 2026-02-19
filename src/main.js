import { Game } from './Game.js';
import '../style.css';

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  game.start();
});
