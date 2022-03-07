import { Monomitter, monomitter } from '@darkforest_eth/events';
import { dangerousHTML, WorldCoords } from 'common-types';
import GameManager from './GameManager';

/**
 * All plugins must conform to this interface. Provides facilities for
 * displaying an interactive UI, as well as references to game state,
 * which are set externally.
 */

export interface PluginProcess {
  new (): this;

  render?: (coords: WorldCoords) => Promise<dangerousHTML>;

  /**
   * Called when the plugin is unloaded. Plugins unload whenever the
   * plugin is edited (modified and saved, or deleted).
   */
  destroy?: () => void;
}

/**
 * Represents a plugin that the user has added to their game. Used
 * internally for storing plugins. Not used for evaluating plugins!
 */
export interface SerializedPlugin {
  /**
   * Unique ID, assigned at the time the plugin is first saved.
   */
  id: string;

  /**
   * This code is a javascript object that complies with the
   * {@link PluginProcess} interface.
   */
  code: string;

  /**
   * Shown in the list of plugins.
   */
  name: string;

  /**
   * {@code new Date.getTime()} at the point that this plugin was saved
   */
  lastEdited: number;
}

/**
 * Represents book-keeping information about a running process. We keep it
 * separate from the process code, so that the plugin doesn't accidentally
 * overwrite this information.
 */
export class ProcessInfo {
  rendered = false;
  hasError = false;
}

export class PluginManager {
  private gameManager: GameManager;

  private pluginLibrary: SerializedPlugin[];

  private pluginProcesses: Record<string, PluginProcess>;
  private pluginProcessInfos: Record<string, ProcessInfo>;

  public constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.pluginLibrary = [];
    this.pluginProcesses = {};
    this.pluginProcessInfos = {};
  }

  /**
   * If a plugin with the given id is running, call its `.destroy()` method,
   * and remove it from `pluginInstances`. Stop listening for new local plugins.
   */
  public destroy(id: string): void {
    if (this.pluginProcesses[id]) {
      try {
        const process = this.pluginProcesses[id];
        if (process && typeof process.destroy === 'function') {
          // TODO: destroy should also receive the element to cleanup event handlers, etc
          process.destroy();
        }
      } catch (e) {
        this.pluginProcessInfos[id].hasError = true;
        console.error('error when destroying plugin', e);
      } finally {
        delete this.pluginProcesses[id];
        delete this.pluginProcessInfos[id];
      }
    }
  }

  public async addPluginToLibrary(
    id: string,
    name: string,
    codeURL: string
  ): Promise<SerializedPlugin> {
    const code = await fetch(codeURL).then((res) => res.text());
    const newPlugin: SerializedPlugin = {
      id,
      lastEdited: new Date().getTime(),
      name,
      code,
    };

    this.pluginLibrary.push(newPlugin);
    localStorage.setItem('pluginLibrary', JSON.stringify(this.pluginLibrary));

    return PluginManager.copy(newPlugin);
  }

  /**
   * Remove the given plugin both from the player's library, and kills
   * the plugin if it is running.
   */
  public async deletePlugin(pluginId: string): Promise<void> {
    this.pluginLibrary = this.pluginLibrary.filter((p) => p.id !== pluginId);
    this.destroy(pluginId);
    localStorage.setItem('pluginLibrary', JSON.stringify(this.pluginLibrary));
  }

  /**
   * Load all plugins from this disk into `pluginLibrary`. Insert the default
   * plugins into the player's library if the default plugins have never been
   * added before. Effectively idempotent after the first time you call it.
   */
  public async load() {
    const stringyPluginLib = localStorage.getItem('pluginLibrary');
    this.pluginLibrary = stringyPluginLib ? JSON.parse(stringyPluginLib) : [];
  }

  /**
   * Gets the serialized plugin with the given id from the player's plugin
   * library. `undefined` if no plugin exists.
   */
  public getPluginFromLibrary(id?: string): SerializedPlugin | undefined {
    return this.pluginLibrary.find((p) => p.id === id);
  }

  /**
   * Either spawns the given plugin by evaluating its `pluginCode`, or
   * returns the already running plugin instance. If starting a plugin
   * throws an error then returns `undefined`.
   */
  public async spawn(id: string): Promise<PluginProcess | undefined> {
    if (this.pluginProcesses[id as string]) {
      return this.pluginProcesses[id as string];
    }

    const plugin = this.getPluginFromLibrary(id);

    if (!plugin) {
      return;
    }

    this.pluginProcessInfos[plugin.id] = new ProcessInfo();

    const moduleFile = new File([plugin.code], plugin.name, {
      type: 'text/javascript',
      lastModified: plugin.lastEdited,
    });
    const moduleUrl = URL.createObjectURL(moduleFile);
    try {
      // The `webpackIgnore` "magic comment" is almost undocumented, but it makes
      // webpack skip over this dynamic `import` call so it won't be transformed into
      // a weird _webpack_require_dynamic_ call
      const { default: Plugin } = await import(/* webpackIgnore: true */ moduleUrl);
      if (this.pluginProcesses[id] === undefined) {
        // instantiate the plugin and attach it to the process list
        this.pluginProcesses[id] = new Plugin();
      }
    } catch (e) {
      console.error(`Failed to start plugin: ${plugin.name} - Please review stack trace\n`, e);
      this.pluginProcessInfos[id].hasError = true;
    }

    return this.pluginProcesses[plugin.id];
  }

  /**
   * For each currently running plugin, if the plugin has a 'render'
   * function, then render that plugin to the screen.
   */
  public async renderAllRunningPlugins(coords: WorldCoords) {
    const res: Map<string, dangerousHTML> = new Map();
    for (const plugin of this.pluginLibrary) {
      const processInfo = this.pluginProcessInfos[plugin.id];
      const pluginInstance = this.pluginProcesses[plugin.id];

      if (pluginInstance && typeof pluginInstance.render === 'function' && !processInfo.hasError) {
        try {
          res.set(plugin.id, await pluginInstance.render(coords));
        } catch (e) {
          console.log('failed to draw plugin', e);
          processInfo.hasError = true;
        }
      }
    }
    return res;
  }

  /**
   * To prevent users of this class from modifying our plugins library,
   * we return clones of the plugins. This should probably be a function
   * in a Utils file somewhere, but I thought I should leave a good comment
   * about why we return copies of the plugins from the library.
   */
  private static copy<T>(plugin: T): T {
    return JSON.parse(JSON.stringify(plugin)) as T;
  }
}
