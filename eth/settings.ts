import toml from '@iarna/toml';
import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
// HRE stuff
import 'hardhat/types/runtime';
import * as path from 'path';
import resolvePackage from 'resolve-package-path';
import dedent from 'ts-dedent';
import * as yup from 'yup';

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    DEPLOYER_MNEMONIC: string | undefined;
    ADMIN_PUBLIC_ADDRESS: string | undefined;

    packageDirs: {
      'common-contracts': string;
    };

    contracts: yup.Asserts<typeof Contracts>;

    initializers: yup.Asserts<typeof Initializers>;
  }
}

export const Contracts = yup
  .object({
    /**
     * Network information
     */
    NETWORK: yup.string().required(),
    NETWORK_ID: yup.number().required(),
    START_BLOCK: yup.number().required(),

    /**
     * Contract addresses
     */
    CORE_CONTRACT_ADDRESS: yup.string().required(),
    GETTERS_CONTRACT_ADDRESS: yup.string().required(),
  })
  .defined();

export const Initializers = yup
  .object({
    SEED_1: yup.number().default(0),
    WORLD_WIDTH: yup.number().default(20),
  })
  .defined();

// Util for parsing & validating schemas with pretty printing
export function parse<S extends yup.BaseSchema>(schema: S, data: unknown): yup.Asserts<S> {
  try {
    return schema.validateSync(data, { abortEarly: false });
  } catch (err) {
    printValidationErrors(err as yup.ValidationError);
    process.exit(1);
  }
}

// A function that iterates over a Hardhat `lazyObject` to force them to be loaded.
//
// This is needed because some of our Yup Schemas have `.required()` properties but aren't
// immediately validated due to `lazyObject`.
export function required<S extends { [key: string]: unknown }>(schema: S, keys: Array<keyof S>) {
  const header = '* Required keys/values:';
  const messages = keys.map((key, idx) => {
    if (typeof key === 'string' || typeof key === 'number') {
      return `* ${idx + 1}. ${key}: ${schema[key]}`;
    } else {
      console.error(chalk.red('Invalid key'), key);
      process.exit(1);
    }
  });

  const longest = messages.reduce((max, msg) => Math.max(msg.length, max), header.length);
  const stars = '*'.repeat(longest);

  const msg = dedent`
    ${stars}
    ${header}
    *
    ${messages.join('\n')}
    ${stars}
  `;

  // We pretty much just log them so we have something to do with them.
  console.log(chalk.green(msg));
}

function printValidationErrors(err: yup.ValidationError) {
  const header = '* Encountered configuration errors:';
  const messages = err.errors.map((msg: string, idx: number) => `* ${idx + 1}. ${msg}`);

  const longest = messages.reduce((max, msg) => Math.max(msg.length, max), header.length);
  const stars = '*'.repeat(longest);

  const msg = dedent`
    ${stars}
    ${header}
    *
    ${messages.join('\n')}
    ${stars}
  `;

  console.error(chalk.red(msg));
}

// Resolve workspace package directories
export function resolvePackageDir(pkg: string) {
  const contractsPkg = resolvePackage(pkg, __dirname);
  if (!contractsPkg) {
    throw new Error(`Unable to find the ${pkg} package. Exiting...`);
  }
  return path.dirname(contractsPkg);
}

function tomlLoader(filename: string, content: string) {
  try {
    return toml.parse(content);
  } catch (err) {
    console.error(chalk.red(`Error parsing ${path.basename(filename)}`));
    console.error(chalk.yellow((err as Error).message));
    process.exit(1);
  }
}

const explorers: { [key: string]: ReturnType<typeof cosmiconfigSync> } = {};

export function load(network: string): { [key: string]: unknown } {
  let explorer = explorers[network];
  if (!explorer) {
    // Config file loading stuff, cache it based on network key
    explorer = explorers[network] = cosmiconfigSync('tinyworld', {
      cache: true,
      searchPlaces: [`tinyworld.${network}.toml`, 'tinyworld.toml'],
      loaders: {
        '.toml': tomlLoader,
      },
    });
  }
  const result = explorer.search();
  if (result) {
    return result.config;
  } else {
    console.warn(chalk.yellow('Could not find `tinyworld.toml` - using defaults.'));
    return {};
  }
}
