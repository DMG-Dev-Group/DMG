const cards = document.querySelectorAll(".card");

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
    const heroHeight = window.innerHeight * 0.90; // 90vh

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

  /* ── Lógica de clique nos cards ── */
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const isActive = card.classList.contains("active");

      /* Remove estados de todos os cards e esconde todos os painéis */
      cards.forEach(c => {
        c.classList.remove("active", "inactive");
        c.querySelectorAll(".member-info").forEach(p => p.classList.remove("visible"));
      });

      if (isActive) {
        /* Segundo clique: fecha tudo */
        return;
      }

      /* Ativa o card clicado */
      card.classList.add("active");

      /* Inativa os demais */
      cards.forEach(c => {
        if (c !== card) c.classList.add("inactive");
      });

      /* Exibe os painéis do card clicado */
      card.querySelectorAll(".member-info").forEach(p => p.classList.add("visible"));
    });
  });
});

/* ==========================================================================
   PACKAGES SECTION - INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const packageCards = document.querySelectorAll('.package-card');
  const packageOverlay = document.getElementById('packageOverlay');
  const packageOverlayContent = document.getElementById('overlayContent');
  const packageOverlayClose = document.getElementById('overlayClose');

  // Consolidated Package Data
  const packageInfo = {
    'launch': {
      icon: '🚀',
      name: 'Launch',
      tagline: 'Presença Digital Imediata',
      description: 'Coloque sua empresa na internet rapidamente utilizando um modelo profissional desenvolvido pela DMG. Ideal para quem busca agilidade sem abrir mão da qualidade técnica.',
      features: ['Landing Page Premium', 'Design Responsivo', 'Integração WhatsApp', 'SEO Básico', 'Formulário de Contato', 'SSL Incluso'],
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Analytics'],
      time: '5 a 10 dias úteis',
      price: 'R$ 1.500'
    },
    'prime': {
      icon: '✨',
      name: 'Prime',
      tagline: 'Exclusividade e Autoridade',
      description: 'Landing Page totalmente personalizada para empresas que desejam transmitir autoridade e exclusividade. Design único focado em conversão e identidade de marca.',
      features: ['Design Exclusivo', 'UI/UX Sob Medida', 'SEO Otimizado', 'Google Maps', 'Analytics Avançado', 'Formulários Inteligentes'],
      tech: ['React/Next.js', 'Node.js', 'Framer Motion', 'Vercel'],
      time: '10 a 20 dias úteis',
      price: 'R$ 3.000'
    },
    'commerce': {
      icon: '🛒',
      name: 'Commerce',
      tagline: 'Vendas Diretas via WhatsApp',
      description: 'Loja virtual simplificada para empresas que desejam vender online utilizando o WhatsApp como canal principal. Perfeito para comércios locais e catálogos.',
      features: ['Catálogo de Produtos', 'Categorias Dinâmicas', 'Busca Inteligente', 'Integração WhatsApp', 'Painel Administrativo', 'SEO de Produtos'],
      tech: ['Node.js', 'PostgreSQL', 'Redis', 'Cloudinary'],
      time: '15 a 30 dias úteis',
      price: 'R$ 4.500'
    },
    'commerce-pro': {
      icon: '💎',
      name: 'Commerce Pro',
      tagline: 'E-commerce Profissional Escalonável',
      description: 'Plataforma completa de e-commerce com recursos profissionais para empresas que desejam crescer. Gestão total de estoque, clientes e pagamentos online.',
      features: ['Login de Clientes', 'Carrinho e Checkout', 'Pagamentos Online', 'Gestão de Estoque', 'Cupons de Desconto', 'Dashboard de Vendas'],
      tech: ['Next.js', 'TypeScript', 'Stripe', 'AWS'],
      time: '30 a 60 dias úteis',
      price: 'R$ 7.500'
    },
    'enterprise': {
      icon: '⚙️',
      name: 'Enterprise',
      tagline: 'Sistemas e Soluções Customizadas',
      description: 'Desenvolvimento de sistemas totalmente personalizados para atender necessidades específicas da empresa. De CRMs a Inteligência Artificial sob medida.',
      features: ['CRM/ERP Customizado', 'Plataformas SaaS', 'Sistemas Financeiros', 'Integração de APIs', 'Inteligência Artificial', 'Segurança Bancária'],
      tech: ['Go', 'Rust', 'Kubernetes', 'Python/IA'],
      time: 'Sob consulta',
      price: 'R$ 12.000'
    }
  };

  // TILT EFFECT
  packageCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set CSS variables for glow effect
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

      // Calculate rotation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 12;
      const rotateY = (centerX - x) / 12;

      card.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });

    // Open Modal
    card.addEventListener('click', () => {
      const packageId = card.getAttribute('data-package');
      const data = packageInfo[packageId];

      if (data) {
        renderPackageDetails(data);
        packageOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function renderPackageDetails(data) {
    packageOverlayContent.innerHTML = `
            <div class="expanded-header">
                <div class="expanded-icon">${data.icon}</div>
                <div class="expanded-title">
                    <h2>${data.name}</h2>
                    <p>${data.tagline}</p>
                </div>
            </div>
            <div class="expanded-body">
                <div class="expanded-info">
                    <h3>Visão Geral</h3>
                    <p>${data.description}</p>
                    <h3>Recursos Inclusos</h3>
                    <ul class="features-list">
                        ${data.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="expanded-specs">
                    <div class="spec-item">
                        <span class="spec-label">Tecnologias Core</span>
                        <div class="tech-pills">
                            ${data.tech.map(t => `<span class="info-pill">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Prazo Estimado</span>
                        <span class="spec-value">${data.time}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Investimento</span>
                        <span class="spec-value" style="color: var(--red); font-size: 28px;">${data.price}</span>
                    </div>
                </div>
            </div>
            <div class="expanded-actions">
                <button class="btn-cta secondary">Ver demonstração</button>
                <button class="btn-cta primary">Solicitar orçamento</button>
            </div>
        `;
  }

  // Close Logic
  const closeOverlay = () => {
    packageOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  packageOverlayClose.addEventListener('click', closeOverlay);
  packageOverlay.addEventListener('click', (e) => {
    if (e.target === packageOverlay) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && packageOverlay.classList.contains('active')) closeOverlay();
  });
});