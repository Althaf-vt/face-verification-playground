/**
 * FPS, latency, and performance tracking for biometric QA diagnostics.
 */

export class PerformanceMonitor {
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frameTimes = [];
    this.detectionLatencies = [];
    this.lastFrameTime = performance.now();
    this.fps = 0;
    this.avgDetectionLatency = 0;
    this.detectionFailures = 0;
    this.totalDetections = 0;
    this.descriptorDistances = [];
  }

  tickFrame() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
    const avgDelta =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgDelta);
    return this.fps;
  }

  recordDetection(latencyMs, success = true) {
    this.totalDetections++;
    if (!success) {
      this.detectionFailures++;
      return;
    }
    this.detectionLatencies.push(latencyMs);
    if (this.detectionLatencies.length > this.sampleSize) {
      this.detectionLatencies.shift();
    }
    this.avgDetectionLatency = Math.round(
      this.detectionLatencies.reduce((a, b) => a + b, 0) /
        this.detectionLatencies.length
    );
  }

  recordDescriptorDistance(distance) {
    this.descriptorDistances.push(distance);
    if (this.descriptorDistances.length > 100) {
      this.descriptorDistances.shift();
    }
  }

  getAverageDescriptorDistance() {
    if (!this.descriptorDistances.length) return null;
    const sum = this.descriptorDistances.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.descriptorDistances.length) * 1000) / 1000;
  }

  getFailureRate() {
    if (!this.totalDetections) return 0;
    return Math.round((this.detectionFailures / this.totalDetections) * 100);
  }

  estimateCpuUsage() {
    const targetFps = 30;
    const load = Math.min(100, Math.round((targetFps / Math.max(this.fps, 1)) * 50));
    return Math.max(10, load);
  }

  getSnapshot() {
    return {
      fps: this.fps,
      avgDetectionLatency: this.avgDetectionLatency,
      detectionFailures: this.detectionFailures,
      totalDetections: this.totalDetections,
      failureRate: this.getFailureRate(),
      avgDescriptorDistance: this.getAverageDescriptorDistance(),
      cpuEstimate: this.estimateCpuUsage(),
    };
  }

  reset() {
    this.frameTimes = [];
    this.detectionLatencies = [];
    this.detectionFailures = 0;
    this.totalDetections = 0;
    this.fps = 0;
    this.avgDetectionLatency = 0;
  }
}
