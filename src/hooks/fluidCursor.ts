interface GLContext {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  isWebGL2: boolean;
  ext: {
    halfFloatTexType: number | undefined;
    supportLinearFiltering: any;
  };
}

const useFluidCursor = () => {
  const canvas = document.getElementById("fluid") as HTMLCanvasElement;
  if (!canvas) return;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  let config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1440,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0.5, g: 0, b: 0 },
    TRANSPARENT: true,
  };

  function pointerPrototype(this: any) {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [0, 0, 0];
  }

  let pointers: any[] = [];
  pointers.push(new (pointerPrototype as any)());

  function initWebGL(canvas: HTMLCanvasElement): GLContext {
    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    // Try WebGL2 first
    const gl2Context = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
    if (gl2Context) {
      const ext = gl2Context.getExtension("EXT_color_buffer_float");
      const supportLinearFiltering = gl2Context.getExtension("OES_texture_float_linear");
      gl2Context.clearColor(0.0, 0.0, 0.0, 1.0);
      return {
        gl: gl2Context,
        isWebGL2: true,
        ext: {
          halfFloatTexType: gl2Context.HALF_FLOAT,
          supportLinearFiltering,
        },
      };
    }

    // Fall back to WebGL1
    const gl1Context = (
      canvas.getContext("webgl", params) || 
      canvas.getContext("experimental-webgl", params)
    ) as WebGLRenderingContext | null;

    if (!gl1Context) {
      throw new Error('WebGL not supported');
    }

    const halfFloat = gl1Context.getExtension("OES_texture_half_float");
    const supportLinearFiltering = gl1Context.getExtension("OES_texture_half_float_linear");
    gl1Context.clearColor(0.0, 0.0, 0.0, 1.0);

    return {
      gl: gl1Context,
      isWebGL2: false,
      ext: {
        halfFloatTexType: halfFloat?.HALF_FLOAT_OES,
        supportLinearFiltering,
      },
    };
  }

  try {
    const context = initWebGL(canvas);
    const { gl, ext } = context;

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    // Mouse event handlers
    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pointer = pointers[0];

      pointer.moved = pointer.down;
      pointer.texcoordX = x / canvas.width;
      pointer.texcoordY = 1.0 - y / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
    }

    function handleMouseDown(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pointer = pointers[0];

      pointer.down = true;
      pointer.color = [
        Math.random() + 0.2,
        Math.random() + 0.2,
        Math.random() + 0.2,
      ];
      pointer.texcoordX = x / canvas.width;
      pointer.texcoordY = 1.0 - y / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
    }

    function handleMouseUp() {
      pointers[0].down = false;
    }

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Animation frame
    let animationFrameId: number;

    function animate() {
      if (!config.PAUSED) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
      config.PAUSED = true;
    };
  } catch (error) {
    console.error('Error initializing WebGL:', error);
    return;
  }
};

export default useFluidCursor;
