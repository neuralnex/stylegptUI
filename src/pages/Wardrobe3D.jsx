import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { wardrobeAPI } from "../utils/api";
import * as THREE from "three";
import Header from "../components/Header";
import "./Wardrobe3D.scss";

const Wardrobe3D = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const itemsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [controls, setControls] = useState({ rotate: true, autoRotate: true });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Group items by category
  const groupByCategory = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const category = item.category || "other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  // Load wardrobe items
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await wardrobeAPI.list();
      if (res.success) {
        setItems(res.items || []);
      } else {
        setError(res.error || "Failed to load wardrobe");
      }
    } catch (err) {
      setError(err.message || "Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (itemId, itemCategory) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemCategory}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await wardrobeAPI.delete(itemId);
      if (res.success) {
        // Remove item from local state - this will trigger scene rebuild
        setItems(items.filter((item) => item.id !== itemId));
        // Clear selection if deleted item was selected
        if (selectedCategory === itemCategory) {
          setSelectedCategory(null);
        }
      } else {
        alert(res.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete item. Please try again.");
    }
  };

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current || loading || items.length === 0) return;

    // Clear previous scene if it exists
    if (rendererRef.current) {
      const oldCanvas = mountRef.current.querySelector('canvas');
      if (oldCanvas) {
        mountRef.current.removeChild(oldCanvas);
      }
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Group items by category
    const groupedItems = groupByCategory(items);
    const categories = Object.keys(groupedItems);
    const categoryColors = [
      0xff6b9d, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181,
      0xaa96da, 0xfcbad3, 0xffffd2, 0xa8e6cf, 0xffd3a5
    ];

    // Create category platforms
    const platformRadius = 3;
    const angleStep = (Math.PI * 2) / categories.length;
    const centerRadius = 8;

    categories.forEach((category, catIndex) => {
      const angle = catIndex * angleStep;
      const x = Math.cos(angle) * centerRadius;
      const z = Math.sin(angle) * centerRadius;

      // Category platform
      const platformGeometry = new THREE.CylinderGeometry(platformRadius, platformRadius, 0.2, 32);
      const platformColor = categoryColors[catIndex % categoryColors.length];
      const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: platformColor,
        emissive: platformColor,
        emissiveIntensity: 0.2
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(x, -1.8, z);
      platform.receiveShadow = true;
      scene.add(platform);

      // Category label (using a simple plane with text texture would be better, but for now use a box)
      const labelGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
      const labelMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(x, -0.5, z);
      scene.add(label);

      // Items in this category
      const categoryItems = groupedItems[category];
      const itemsPerCategory = categoryItems.length;
      const itemsPerRow = Math.ceil(Math.sqrt(itemsPerCategory));
      const spacing = 0.8;

      categoryItems.forEach((item, itemIndex) => {
        const row = Math.floor(itemIndex / itemsPerRow);
        const col = itemIndex % itemsPerRow;
        const offsetX = (col - itemsPerRow / 2) * spacing;
        const offsetZ = (row - itemsPerRow / 2) * spacing;

        // Load texture - prefer processed image (background removed) for better 3D effect
        const textureLoader = new THREE.TextureLoader();
        const imageUrl = item.processedImageUrl || item.imageUrl;
        
        // Create a placeholder plane first (will be replaced when texture loads)
        const placeholderGeometry = new THREE.PlaneGeometry(1, 1);
        const placeholderMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.3
        });
        const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        placeholder.position.set(
          x + offsetX,
          -1.5 + (row * 0.1),
          z + offsetZ
        );
        placeholder.rotation.y = angle + Math.PI / 2;
        placeholder.userData = { item, category, isPlaceholder: true };
        scene.add(placeholder);
        
        textureLoader.load(
          imageUrl,
          (texture) => {
            // Remove placeholder
            scene.remove(placeholder);
            
            // Create plane for item with proper aspect ratio
            const aspect = texture.image.width / texture.image.height;
            const planeWidth = 1;
            const planeHeight = planeWidth / aspect;
            
            // Ensure minimum size for visibility
            const minSize = 0.5;
            const maxSize = 1.5;
            const finalWidth = Math.max(minSize, Math.min(maxSize, planeWidth));
            const finalHeight = Math.max(minSize, Math.min(maxSize, planeHeight));
            
            const planeGeometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
            const planeMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide,
              alphaTest: 0.1,
              depthWrite: false // Better transparency handling
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.position.set(
              x + offsetX,
              -1.5 + (row * 0.1),
              z + offsetZ
            );
            plane.rotation.y = angle + Math.PI / 2;
            plane.castShadow = true;
            plane.receiveShadow = true;
            
            // Add hover interaction and item data
            plane.userData = { 
              item, 
              category,
              originalPosition: { x: x + offsetX, y: -1.5 + (row * 0.1), z: z + offsetZ }
            };
            scene.add(plane);
            itemsRef.current.push(plane);

            // Add slight random rotation for visual interest
            plane.rotation.z = (Math.random() - 0.5) * 0.2;
            
            // Dispose of texture when done (handled by Three.js automatically)
          },
          (progress) => {
            // Loading progress (optional - can show loading indicator)
            if (progress.total > 0) {
              const percent = (progress.loaded / progress.total) * 100;
              // Could update placeholder opacity based on progress
            }
          },
          (err) => {
            console.error(`Failed to load texture for ${item.category} (${item.id}):`, err);
            // Keep placeholder visible on error, or remove it
            placeholder.material.opacity = 0.1;
            placeholder.material.color.setHex(0xff0000); // Red to indicate error
          }
        );
      });
    });

    // Mouse controls for camera rotation
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const onMouseDown = (event) => {
      isMouseDown = true;
      // Update mouse position on mousedown
      mouseX = (event.clientX / width) * 2 - 1;
      mouseY = -(event.clientY / height) * 2 + 1;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (event) => {
      if (isMouseDown) {
        mouseX = (event.clientX / width) * 2 - 1;
        mouseY = -(event.clientY / height) * 2 + 1;
      }
    };

    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY * 0.01;
      camera.position.multiplyScalar(1 + delta);
      camera.position.clampLength(5, 30);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Raycaster for item selection and hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    const onMouseMoveForHover = (event) => {
      // Only handle hover when not dragging
      if (isMouseDown) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(itemsRef.current);

      // Remove hover effect from previous object
      if (hoveredObject && hoveredObject.userData.originalScale) {
        hoveredObject.scale.set(...hoveredObject.userData.originalScale);
        hoveredObject = null;
      }

      // Add hover effect to new object
      if (intersects.length > 0 && !intersects[0].object.userData.isPlaceholder) {
        hoveredObject = intersects[0].object;
        if (!hoveredObject.userData.originalScale) {
          hoveredObject.userData.originalScale = [...hoveredObject.scale.toArray()];
        }
        hoveredObject.scale.multiplyScalar(1.2); // Scale up on hover
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(itemsRef.current);

      if (intersects.length > 0 && !intersects[0].object.userData.isPlaceholder) {
        const clickedItem = intersects[0].object.userData.item;
        if (clickedItem) {
          setSelectedCategory(clickedItem.category);
          // Optional: Add a pulse effect
          const clickedObject = intersects[0].object;
          const originalScale = clickedObject.userData.originalScale || [1, 1, 1];
          clickedObject.scale.set(...originalScale);
          clickedObject.scale.multiplyScalar(1.3);
          setTimeout(() => {
            if (clickedObject.userData.originalScale) {
              clickedObject.scale.set(...clickedObject.userData.originalScale);
            }
          }, 200);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMoveForHover);
    renderer.domElement.addEventListener("click", onMouseClick);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Auto-rotate camera
      if (controls.autoRotate) {
        const time = Date.now() * 0.0005;
        camera.position.x = Math.cos(time) * 15;
        camera.position.z = Math.sin(time) * 15;
        camera.lookAt(0, 0, 0);
      } else if (isMouseDown) {
        // Manual rotation
        camera.position.x = Math.cos(mouseX * Math.PI) * 15;
        camera.position.z = Math.sin(mouseX * Math.PI) * 15;
        camera.position.y = 5 + mouseY * 5;
        camera.lookAt(0, 0, 0);
      }

      // Rotate items slightly
      itemsRef.current.forEach((item) => {
        item.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        if (rendererRef.current && rendererRef.current.domElement) {
          rendererRef.current.domElement.removeEventListener("mousemove", onMouseMove);
          rendererRef.current.domElement.removeEventListener("mousemove", onMouseMoveForHover);
          rendererRef.current.domElement.removeEventListener("mousedown", onMouseDown);
          rendererRef.current.domElement.removeEventListener("mouseup", onMouseUp);
          rendererRef.current.domElement.removeEventListener("wheel", onWheel);
          rendererRef.current.domElement.removeEventListener("click", onMouseClick);
        }
      cancelAnimationFrame(animationId);
      
      // Dispose of all scene objects
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => {
                if (mat.map) mat.map.dispose();
                mat.dispose();
              });
            } else {
              if (object.material.map) object.material.map.dispose();
              object.material.dispose();
            }
          }
        }
      });
      
      // Remove canvas
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Clear refs
      itemsRef.current = [];
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, [loading, items, controls]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="wardrobe3d-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading 3D wardrobe...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wardrobe3d-page">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/wardrobe")}>Back to 2D View</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wardrobe3d-page">
        <Header />
        <div className="empty-container">
          <h2>No items yet</h2>
          <p>Upload your clothes to see them in 3D space</p>
          <button onClick={() => navigate("/upload")}>Upload Wardrobe</button>
        </div>
      </div>
    );
  }

  const groupedItems = groupByCategory(items);
  const categories = Object.keys(groupedItems);

  return (
    <div className="wardrobe3d-page">
      <Header />
      <div className="wardrobe3d-container">
        <div className="controls-panel">
          <h2>3D Wardrobe</h2>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={controls.autoRotate}
                onChange={(e) => setControls({ ...controls, autoRotate: e.target.checked })}
              />
              Auto Rotate
            </label>
          </div>
          <div className="categories-list">
            <h3>Categories ({categories.length})</h3>
            {categories.map((category) => (
              <div key={category} className="category-group">
                <div
                  className={`category-item ${selectedCategory === category ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="category-name">{category}</span>
                  <span className="category-count">({groupedItems[category].length})</span>
                </div>
                {selectedCategory === category && (
                  <div className="category-items-list">
                    {groupedItems[category].map((item) => (
                      <div key={item.id} className="item-in-category">
                        <span className="item-preview">
                          <img 
                            src={item.processedImageUrl || item.imageUrl} 
                            alt={item.category}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </span>
                        <span className="item-style">{item.style}</span>
                        <button
                          className="delete-item-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.category);
                          }}
                          title="Delete item"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="instructions">
            <p>🖱️ Click and drag to rotate</p>
            <p>🔍 Scroll to zoom</p>
            <p>👆 Click items to select</p>
          </div>
          <button className="back-btn" onClick={() => navigate("/wardrobe")}>
            Back to 2D View
          </button>
        </div>
        <div className="canvas-container" ref={mountRef}></div>
      </div>
    </div>
  );
};

export default Wardrobe3D;

