/**
 * Image preloader utility for better performance
 */

export class ImagePreloader {
  private preloadedImages: Set<string> = new Set()
  private loadingPromises: Map<string, Promise<void>> = new Map()

  /**
   * Preload a single image
   */
  preloadImage(src: string): Promise<void> {
    if (this.preloadedImages.has(src)) {
      return Promise.resolve()
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.preloadedImages.add(src)
        this.loadingPromises.delete(src)
        console.log(`✅ Preloaded: ${src}`)
        resolve()
      }
      
      img.onerror = () => {
        this.loadingPromises.delete(src)
        console.warn(`❌ Failed to preload: ${src}`)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      img.src = src
    })

    this.loadingPromises.set(src, promise)
    return promise
  }

  /**
   * Preload multiple images
   */
  async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src))
    await Promise.allSettled(promises)
  }

  /**
   * Check if an image is already preloaded
   */
  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src)
  }

  /**
   * Get all preloaded image sources
   */
  getPreloadedImages(): string[] {
    return Array.from(this.preloadedImages)
  }

  /**
   * Clear preloaded images cache
   */
  clearCache(): void {
    this.preloadedImages.clear()
    this.loadingPromises.clear()
  }
}

// Create a singleton instance
export const imagePreloader = new ImagePreloader()



