import Store from 'electron-store'
import { AppConfig, DEFAULT_CONFIG } from '@shared/types/config'

export class ConfigStore {
  private store: Store<AppConfig>

  constructor() {
    this.store = new Store<AppConfig>({
      name: 'config',
      defaults: DEFAULT_CONFIG,
    })
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.store.get(key)
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.store.set(key, value)
  }

  getAll(): AppConfig {
    return this.store.store
  }

  reset(): void {
    this.store.clear()
  }
}
