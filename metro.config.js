const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Add alias resolver for ~ 
config.resolver.alias = {
  '~': path.resolve(__dirname, '.'),
};

module.exports = withNativeWind(config, { input: './app/globals.css' })