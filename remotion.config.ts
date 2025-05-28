import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setImageSequence(false);

// Set the entry point for Remotion compositions
Config.setEntryPoint('./src/remotion/compositions/index.tsx');

// Configure output directory
Config.setOutputLocation('./public/generated-creatives/');

// Enable concurrent rendering for better performance
Config.setConcurrency(1);

// Set browser executable path (optional, Remotion will auto-detect)
// Config.setBrowserExecutable('/path/to/browser');

// Configure webpack overrides for better compatibility
Config.overrideWebpackConfig((config) => {
  // Handle node modules that might cause issues
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      fs: false,
      path: false,
      crypto: false,
    },
  };

  return config;
}); 