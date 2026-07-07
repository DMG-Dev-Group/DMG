// Lajes pretas sólidas que se abrem para revelar luz vermelha por baixo
class GridTile {
  constructor(x, y, gridSize) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.gridSize = gridSize;
    this.vx = 0;
    this.vy = 0;
    this.maxDistance = gridSize * 3;
  }

  update(mouseX, mouseY, repelRadius) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se o mouse está perto, aplicar força de repulsão
    if (distance < repelRadius) {
      const force = (1 - distance / repelRadius) * 0.6;
      const angle = Math.atan2(dy, dx);
      
      this.vx += Math.cos(angle) * force * 3;
      this.vy += Math.sin(angle) * force * 3;
    }

    // Aplicar velocidade
    this.x += this.vx;
    this.y += this.vy;

    // Damping mais forte para movimento mais controlado
    this.vx *= 0.80;
    this.vy *= 0.80;

    // Retornar para posição original (elasticidade)
    const returnForce = 0.04;
    this.vx += (this.originalX - this.x) * returnForce;
    this.vy += (this.originalY - this.y) * returnForce;

    // Limitar distância máxima
    const distFromOriginal = Math.sqrt(
      (this.x - this.originalX) ** 2.5 + (this.y - this.originalY) ** 2
    );
    if (distFromOriginal > this.maxDistance) {
      const angle = Math.atan2(this.y - this.originalY, this.x - this.originalX);
      this.x = this.originalX + Math.cos(angle) * this.maxDistance;
      this.y = this.originalY + Math.sin(angle) * this.maxDistance;
    }
  }

  draw(ctx, gridSize) {
    // Desenhar as lajes como quadrados pretos sólidos
    ctx.fillStyle = '#080808';
    ctx.fillRect(
      this.x - this.gridSize / 2,
      this.y - this.gridSize / 2,
      this.gridSize,
      this.gridSize
    );

    // Desenhar as linhas do grid sobre as lajes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.gridSize / 2,
      this.y - this.gridSize / 2,
      this.gridSize,
      this.gridSize
    );
  }
}

class GridSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tiles = [];
    this.gridSize = 60;
    this.mouseX = 0;
    this.mouseY = 0;
    this.repelRadius = 280;
    this.scrollY = 0;
    
    this.setupCanvas();
    this.createGrid();
    this.setupEventListeners();
    this.animate();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  createGrid() {
    this.tiles = [];
    // Criar grid que cobre a área do hero com preenchimento total
    const heroHeight = window.innerHeight * 0.88; // 88vh
    
    for (let y = 0; y <= heroHeight; y += this.gridSize) {
      for (let x = 0; x <= window.innerWidth; x += this.gridSize) {
        this.tiles.push(new GridTile(x, y, this.gridSize));
      }
    }
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      // Ajustar mouseY considerando o scroll
      this.mouseY = e.clientY + window.scrollY;
    });

    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    });
  }

  drawVolumetricRedLight() {
    // Fundo com luz vermelha volumétrica NEON
    // A luz é revelada apenas onde as lajes se abrem
    
    // Calcular posição do mouse relativa ao canvas (considerando scroll)
    const mouseYInCanvas = this.mouseY - this.scrollY;
    
    // Criar um gradiente radial baseado na posição do mouse com cores neon vibrantes
    const gradient = this.ctx.createRadialGradient(
      this.mouseX, mouseYInCanvas, 0,
      this.mouseX, mouseYInCanvas, this.repelRadius * 1.8
    );

    // Cores neon mais vibrantes e saturadas
    gradient.addColorStop(0, 'rgba(220, 0, 0, 1)');      // Vermelho Puro Intenso
    gradient.addColorStop(0.3, 'rgba(150, 0, 0, 0.8)');  // Vermelho Sangue
    gradient.addColorStop(0.6, 'rgba(80, 0, 0, 0.4)');   // Vermelho Escuro
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');        // Transparente

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Brilho central mais intenso e neon
    const innerGradient = this.ctx.createRadialGradient(
      this.mouseX, mouseYInCanvas, 0,
      this.mouseX, mouseYInCanvas, this.repelRadius * 0.6
    );

    innerGradient.addColorStop(0, 'rgba(255, 0, 50, 1)');
    innerGradient.addColorStop(0.3, 'rgba(255, 50, 100, 0.8)');
    innerGradient.addColorStop(0.6, 'rgba(220, 20, 60, 0.4)');
    innerGradient.addColorStop(1, 'rgba(192, 24, 26, 0)');

    this.ctx.fillStyle = innerGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    // Preencher o fundo com a cor preta base
    this.ctx.fillStyle = '#080808';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar a luz vermelha volumétrica por baixo
    this.drawVolumetricRedLight();

    // Atualizar e desenhar as lajes pretas sólidas
    this.tiles.forEach(tile => {
      tile.update(this.mouseX, this.mouseY, this.repelRadius);
      tile.draw(this.ctx, this.gridSize);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gridCanvas');
  if (canvas) {
    new GridSystem(canvas);
  }

  // Manter a funcionalidade dos cards
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("active")) {
        cards.forEach(c => {
          c.classList.remove("active", "inactive");
        });
        return;
      }

      cards.forEach(c => {
        c.classList.remove("active", "inactive");
      });

      card.classList.add("active");

      cards.forEach(c => {
        if (c !== card) {
          c.classList.add("inactive");
        }
      });
    });
  });
});
