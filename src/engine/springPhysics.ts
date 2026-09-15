/**
 * 2nd-Order Damped Harmonic Spring Camera Controller
 * Equation: F = -k * (x - x_target) - c * v
 */

export interface SpringConfig {
  stiffness: number; // k: spring tension / responsiveness (e.g. 120 - 260)
  damping: number;   // c: friction damping (e.g. 18 - 35)
  mass?: number;
}

export class DampedSpring {
  public current: number;
  public target: number;
  public velocity: number = 0;
  public config: SpringConfig;

  constructor(initial: number, config: SpringConfig) {
    this.current = initial;
    this.target = initial;
    this.config = config;
  }

  public setTarget(target: number) {
    this.target = target;
  }

  public reset(val: number) {
    this.current = val;
    this.target = val;
    this.velocity = 0;
  }

  public update(dt: number): number {
    const k = this.config.stiffness;
    const c = this.config.damping;
    const m = this.config.mass || 1.0;

    // Acceleration a = F / m = (-k * (x - target) - c * v) / m
    const displacement = this.current - this.target;
    const force = -k * displacement - c * this.velocity;
    const acceleration = force / m;

    this.velocity += acceleration * dt;
    this.current += this.velocity * dt;

    return this.current;
  }
}

export class SpringCameraEngine {
  public zoomSpring: DampedSpring;
  public focusXSpring: DampedSpring;
  public focusYSpring: DampedSpring;

  constructor(config: SpringConfig) {
    this.zoomSpring = new DampedSpring(1.0, config);
    this.focusXSpring = new DampedSpring(0.5, config);
    this.focusYSpring = new DampedSpring(0.5, config);
  }

  public updateConfig(config: SpringConfig) {
    this.zoomSpring.config = config;
    this.focusXSpring.config = config;
    this.focusYSpring.config = config;
  }

  public setTargets(zoom: number, focusX: number, focusY: number) {
    this.zoomSpring.setTarget(zoom);
    this.focusXSpring.setTarget(focusX);
    this.focusYSpring.setTarget(focusY);
  }

  public reset(zoom = 1.0, focusX = 0.5, focusY = 0.5) {
    this.zoomSpring.reset(zoom);
    this.focusXSpring.reset(focusX);
    this.focusYSpring.reset(focusY);
  }

  public tick(dt: number) {
    const zoom = this.zoomSpring.update(dt);
    const focusX = this.focusXSpring.update(dt);
    const focusY = this.focusYSpring.update(dt);

    return {
      zoom: Math.max(1.0, zoom),
      focusX,
      focusY,
    };
  }
}
