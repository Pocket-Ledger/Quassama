const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow .cjs (already done by Expo)…
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('cjs');

// Disable Node package-exports enforcement:
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });