// src/components/CardPreview.tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import * as THREE from 'three';
import type { CardData } from '../types/card';

interface CardPreviewProps {
  cardData: CardData;
}

export default function CardPreview({ cardData: initialCardData }: CardPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState(initialCardData);
  const [isRotating, setIsRotating] = useState(true);
  const [is3DMode, setIs3DMode] = useState(true);
  const controlsRef = useRef({ isRotating: true });

  // Store camera and card state
  const sceneRef = useRef({
    camera: {
      position: new THREE.Vector3(0, 0, 6),
      rotation: new THREE.Euler(0, 0, 0)
    },
    card: {
      rotation: new THREE.Euler(0, 0, 0)
    }
  });

  // Create canvas for card texture with image support
  const createCardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Draw initial background
    const isRedCard = cardData.pokerCardSymbol === 'Hearts' || cardData.pokerCardSymbol === 'Diamonds';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isRedCard) {
      gradient.addColorStop(0, '#1a0000');
      gradient.addColorStop(1, '#400000');
    } else {
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#202020');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the gray background for the image area first
    ctx.fillStyle = '#202020';
    ctx.fillRect(40, 160, canvas.width - 80, 720);

    // Draw all other card elements
    drawCardElements(ctx, isRedCard);

    // Handle image loading separately
    if (cardData.image) {
      return new Promise<HTMLCanvasElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
          const imageAreaX = 40;
          const imageAreaY = 160;
          const imageAreaWidth = canvas.width - 80;
          const imageAreaHeight = 720;

          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight, drawX, drawY;

          if (aspectRatio > imageAreaWidth / imageAreaHeight) {
            drawWidth = imageAreaWidth;
            drawHeight = drawWidth / aspectRatio;
            drawX = imageAreaX;
            drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2;
          } else {
            drawHeight = imageAreaHeight;
            drawWidth = drawHeight * aspectRatio;
            drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2;
            drawY = imageAreaY;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          resolve(canvas);
        };

        if (cardData.image instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(cardData.image);
        } else {
          img.src = cardData.image;
        }
      });
    }

    return canvas;
  };

  // Separate function for drawing card elements
  const drawCardElements = (ctx: CanvasRenderingContext2D, isRedCard: boolean) => {
    // Draw chess piece icon with larger size
    const chessPieceMap = {
      'Pawn': '♟',
      'Knight': '♞',
      'Bishop': '♝',
      'Rook': '♜',
      'Queen': '♛',
      'King': '♚'
    };
    ctx.fillStyle = isRedCard ? '#800000' : '#000000';
    ctx.font = 'bold 72px "Space Mono"';
    if (cardData.chessPieceType && chessPieceMap[cardData.chessPieceType as keyof typeof chessPieceMap]) {
      ctx.fillText(chessPieceMap[cardData.chessPieceType as keyof typeof chessPieceMap], 60, 105);
    }

    // Draw card name
    ctx.font = 'bold 48px "Space Mono"';
    ctx.fillText(cardData.name || 'Untitled Card', 150, 105);

    // Draw poker symbol with Stick font and consistent colors
    const symbolMap = {
      'Diamonds': '♦',
      'Hearts': '♥',
      'Clubs': '♣',
      'Spades': '♠'
    };
    ctx.font = 'bold 72px "Stick"';
    ctx.fillStyle = isRedCard ? '#CC0000' : '#000000';
    ctx.fillText(symbolMap[cardData.pokerCardSymbol], ctx.canvas.width - 120, 105);

    // Optionally draw grid overlay if no image (or always, as a subtle effect behind the image)
    if (!cardData.image) {
      ctx.strokeStyle = isRedCard ? '#ff0000' : '#333333';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Draw horizontal grid lines
      for (let y = 160; y < 160 + 720; y += 40) { // Limit to image area height (720)
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(ctx.canvas.width - 40, y);
        ctx.stroke();
      }

      // Draw vertical grid lines
      for (let x = 40; x < ctx.canvas.width - 40; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 160);
        ctx.lineTo(x, 160 + 720); // Limit to image area height (720)
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw card info box with matching theme (on top of image if present)
    ctx.fillStyle = isRedCard ? '#D9D9D9' : '#333333';
    ctx.fillRect(40, ctx.canvas.height - 200, ctx.canvas.width - 80, 160);

    // Draw text with appropriate contrast
    ctx.fillStyle = isRedCard ? '#000000' : '#D9D9D9';
    ctx.font = '24px "Space Mono"';
    const cardInfo = `${cardData.pokerCardType} ${cardData.cardType}`;
    ctx.fillText(cardInfo, 60, ctx.canvas.height - 160);

    // Draw description if it exists
    if (cardData.description) {
      ctx.font = '20px "Space Mono"';
      const words = cardData.description.split(' ');
      let line = '';
      let y = ctx.canvas.height - 130;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > ctx.canvas.width - 120) {
          ctx.fillText(line, 60, y);
          line = word + ' ';
          y += 25;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 60, y);
    }

    // Draw effect if it exists
    if (cardData.effect) {
      ctx.font = 'italic 20px "Space Mono"';
      const words = cardData.effect.split(' ');
      let line = '';
      let y = ctx.canvas.height - 80;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > ctx.canvas.width - 120) {
          ctx.fillText(line, 60, y);
          line = word + ' ';
          y += 25;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 60, y);
    }

    // Draw footer
    ctx.fillStyle = '#000000';
    ctx.font = '20px "Space Mono"';
    ctx.fillText('Warlok山', 60, ctx.canvas.height - 30);
  };

  // Listen for card updates
  useEffect(() => {
    const handlePreviewUpdate = (event: CustomEvent<CardData>) => {
      console.log('Preview update event received:', event.detail); // Debug log
      if (event.detail) {
        setCardData(event.detail);
      }
    };

    document.addEventListener('previewupdate', handlePreviewUpdate as EventListener);

    return () => {
      document.removeEventListener('previewupdate', handlePreviewUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous content
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    if (is3DMode) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 500 / 700, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });

      // Restore camera position and rotation
      camera.position.copy(sceneRef.current.camera.position);
      camera.rotation.copy(sceneRef.current.camera.rotation);

      renderer.setSize(500, 700);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(3.5, 5);
      
      // Handle async texture creation
      Promise.resolve(createCardTexture()).then((canvas) => {
        const cardTexture = new THREE.CanvasTexture(canvas);
        cardTexture.needsUpdate = true;

        const material = new THREE.MeshStandardMaterial({
          map: cardTexture,
          side: THREE.DoubleSide,
          metalness: 0.5,
          roughness: 0.5,
        });

        const card = new THREE.Mesh(geometry, material);
        card.rotation.copy(sceneRef.current.card.rotation);
        scene.add(card);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Mouse controls
        let isRotating = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (event: MouseEvent) => {
          isRotating = true;
          previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseMove = (event: MouseEvent) => {
          if (isRotating) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;
            card.rotation.y += deltaX * 0.01;
            card.rotation.x += deltaY * 0.01;
            previousMousePosition = { x: event.clientX, y: event.clientY };

            // Store card rotation
            sceneRef.current.card.rotation.copy(card.rotation);
          }
        };

        const onMouseUp = () => {
          isRotating = false;
        };

        const onWheel = (event: WheelEvent) => {
          event.preventDefault();
          camera.position.z += event.deltaY * 0.01;
          camera.position.z = Math.max(3, Math.min(10, camera.position.z));

          // Store camera position
          sceneRef.current.camera.position.copy(camera.position);
        };

        // Add event listeners
        const element = renderer.domElement;
        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', onMouseUp);
        element.addEventListener('wheel', onWheel);

        // Automatic rotation when not interacting
        const autoRotate = () => {
          if (controlsRef.current.isRotating && !isRotating) {
            card.rotation.y += 0.005;
            // Store card rotation
            sceneRef.current.card.rotation.copy(card.rotation);
          }
        };

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          autoRotate();
          renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
          element.removeEventListener('mousedown', onMouseDown);
          element.removeEventListener('mousemove', onMouseMove);
          element.removeEventListener('mouseup', onMouseUp);
          element.removeEventListener('wheel', onWheel);
          mountRef.current?.removeChild(renderer.domElement);
          renderer.dispose();
          cardTexture.dispose();
        };
      });
    } else {
      // 2D rendering
      Promise.resolve(createCardTexture()).then((canvas) => {
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = 500;
        displayCanvas.height = 700;
        const ctx = displayCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, displayCanvas.width, displayCanvas.height);
          mountRef.current?.appendChild(displayCanvas);
        }
      });
    }
  }, [cardData, is3DMode]);

  const toggleRotation = () => {
    controlsRef.current.isRotating = !controlsRef.current.isRotating;
    setIsRotating(!isRotating);
  };

  const toggleViewMode = () => {
    setIs3DMode(!is3DMode);
  };

  return (
    <div class="preview-wrapper">
      <div ref={mountRef} class="card-preview" />
      <div class="preview-controls">
        <div class="controls-container">
          {is3DMode && (
            <button
              onClick={toggleRotation}
              class="control-button"
            >
              {isRotating ? '||' : '▶'}
            </button>
          )}
          <label class="view-mode-toggle">
            <input
              type="checkbox"
              checked={is3DMode}
              onChange={toggleViewMode}
            />
            <span class="toggle-slider"></span>
            <span class="toggle-2d">2D</span>
            <span class="toggle-3d">3D</span>
          </label>
        </div>
      </div>
    </div>
  );
}