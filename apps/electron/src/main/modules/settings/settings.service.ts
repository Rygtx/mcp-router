import { app } from "electron";
import { AppSettings } from "@mcp_router/shared";
import { SingletonService } from "../singleton-service";
import { SettingsRepository } from "./settings.repository";

/**
 * Service for managing application settings
 */
export class SettingsService extends SingletonService<
  AppSettings,
  string,
  SettingsService
> {
  /**
   * Constructor
   */
  protected constructor() {
    super();
  }

  /**
   * Get entity name
   */
  protected getEntityName(): string {
    return "Settings";
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SettingsService {
    return (this as any).getInstanceBase();
  }

  /**
   * Reset instance
   * Used when switching workspaces
   */
  public static resetInstance(): void {
    (this as any).resetInstanceBase(SettingsService);
  }

  /**
   * アプリケーション設定を取得
   */
  public getSettings(): AppSettings {
    try {
      return SettingsRepository.getInstance().getSettings();
    } catch (error) {
      return this.handleError("設定取得", error);
    }
  }

  /**
   * 全ての設定を一度に保存
   */
  public saveSettings(settings: AppSettings): boolean {
    try {
      const result = SettingsRepository.getInstance().saveSettings(settings);
      if (result) {
        applyLoginItemSettings(settings.showWindowOnStartup ?? true);
      }
      return result;
    } catch (error) {
      return this.handleError("設定保存", error, false);
    }
  }
}

/**
 * SettingsServiceのシングルトンインスタンスを取得
 */
export function getSettingsService(): SettingsService {
  return SettingsService.getInstance();
}

/**
 * OS起動時のウィンドウ表示設定に応じてログイン項目設定を更新
 */
export function applyLoginItemSettings(showWindowOnStartup: boolean): void {
  try {
    const loginItemOptions: Electron.Settings = {
      openAtLogin: true,
    };

    if (process.platform === "darwin") {
      loginItemOptions.openAsHidden = !showWindowOnStartup;
    } else if (process.platform === "win32") {
      loginItemOptions.args = showWindowOnStartup ? [] : ["--hidden"];
    }

    app.setLoginItemSettings(loginItemOptions);
  } catch (error) {
    console.error("Failed to update login item settings:", error);
  }
}
