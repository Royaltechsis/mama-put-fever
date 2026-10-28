const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// the 3D people are .glb files
config.resolver.assetExts.push('glb');

module.exports = config;
